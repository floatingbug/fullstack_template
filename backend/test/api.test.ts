import { test, before, after } from 'node:test';
import type { TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { ObjectId } from 'mongodb';
import type { Collection } from 'mongodb';
import testServerModule from './helpers/testServer.js';
import type { TestServer } from './helpers/testServer.js';
import type { UserDocument } from '../src/types/user.js';

const { startTestServer } = testServerModule;

let server: TestServer;
let users: Collection<UserDocument>;

interface ApiOptions {
    method?: string;
    body?: unknown;
    token?: string;
    cookie?: string;
}

interface ApiResponse {
    status: number;
    body: any;
    text: string;
    setCookie: string | null;
    contentType: string;
}

function cookieOf(response: ApiResponse): string {
    const setCookie = response.setCookie || "";

    return setCookie.split(";")[0] ?? "";
}

async function api(path: string, { method = "GET", body, token, cookie }: ApiOptions = {}): Promise<ApiResponse> {
    const headers: Record<string, string> = {};

    if (body !== undefined) {
        headers["content-type"] = "application/json";
    }

    if (token) {
        headers.authorization = `Bearer ${token}`;
    }

    if (cookie) {
        headers.cookie = cookie;
    }

    const response = await fetch(server.baseUrl + path, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        redirect: "manual",
    });

    const text = await response.text();
    let parsed: any = null;

    if (text) {
        try {
            parsed = JSON.parse(text);
        }
        catch {
            parsed = text;
        }
    }

    return {
        status: response.status,
        body: parsed,
        text,
        setCookie: response.headers.get("set-cookie"),
        contentType: response.headers.get("content-type") || "",
    };
}

function signIn(nameOrEmail: string, password: string): Promise<ApiResponse> {
    return api("/auth/sign-in", {
        method: "POST",
        body: { nameOrEmail, password },
    });
}

before(async () => {
    server = await startTestServer();
    users = server.db.collection<UserDocument>("users");
});

after(async () => {
    await server.close();
});

test("Backend-API", async (t: TestContext) => {
    let aliceToken: string | undefined;
    let aliceCookie: string | undefined;
    let aliceVerifyToken: string | undefined;
    let resetToken: string | undefined;
    let emailChangeToken: string | undefined;

    await t.test("legt Unique-Indizes für name und email an", async () => {
        const indexes = await users.indexes();
        const email = indexes.find((index) => index.name === "uniq_users_email");
        const name = indexes.find((index) => index.name === "uniq_users_name");

        assert.ok(email, "Index uniq_users_email fehlt");
        assert.ok(name, "Index uniq_users_name fehlt");
        assert.equal(email.unique, true);
        assert.equal(name.unique, true);
    });

    await t.test("weist leere Bodies mit 400 ab", async () => {
        const paths = [
            "/auth/sign-up",
            "/auth/sign-in",
            "/auth/forgot-password",
            "/auth/reset-password",
            "/auth/verify-email/resend",
        ];

        for (const path of paths) {
            const response = await api(path, { method: "POST" });

            assert.equal(
                response.status,
                400,
                `${path} lieferte ${response.status}: ${response.text}`
            );
        }
    });

    await t.test("registriert alice und loggt den Verifikationslink", async () => {
        const mark = server.output().length;
        const response = await api("/auth/sign-up", {
            method: "POST",
            body: {
                name: "alice",
                email: "Alice@Example.com",
                password: "Passwort1",
            },
        });

        assert.equal(response.status, 201);

        const user = await users.findOne({ email: "alice@example.com" });

        assert.ok(user, "User wurde nicht angelegt");
        assert.equal(user.email, "alice@example.com");
        assert.equal(user.emailVerified, false);

        const match = await server.waitForLog(
            mark,
            /\/verify-email\?token=([a-f0-9]{64})/
        );

        aliceVerifyToken = match[1];
        assert.ok(aliceVerifyToken);
    });

    await t.test("verifiziert die E-Mail und entfernt den Token", async () => {
        const response = await api(
            `/auth/verify-email?token=${aliceVerifyToken}`
        );

        assert.equal(response.status, 200);

        const user = await users.findOne({ email: "alice@example.com" });

        assert.equal(user!.emailVerified, true);
        assert.equal(user!.emailTokenHash, undefined);
        assert.equal(user!.emailTokenExpiresAt, undefined);
    });

    await t.test("meldet alice per E-Mail an und setzt das Refresh-Cookie", async () => {
        const response = await signIn("ALICE@example.com", "Passwort1");

        assert.equal(response.status, 200);
        assert.ok(response.body.accessToken);
        assert.equal(response.body.user.email, "alice@example.com");
        assert.equal(response.body.refreshToken, undefined);
        assert.match(response.setCookie || "", /refreshToken=/);

        aliceToken = response.body.accessToken;
        aliceCookie = cookieOf(response);
    });

    await t.test("meldet alice per Name an", async () => {
        const response = await signIn("alice", "Passwort1");

        assert.equal(response.status, 200);
        assert.ok(response.body.accessToken);
    });

    await t.test("lehnt falsche Zugangsdaten ab", async () => {
        const response = await signIn("alice@example.com", "Falsch123");

        assert.equal(response.status, 401);
        assert.equal(response.body.message, "Invalid credentials");
    });

    await t.test("blockiert unverifizierte Accounts", async () => {
        const signUp = await api("/auth/sign-up", {
            method: "POST",
            body: {
                name: "bob",
                email: "bob@example.com",
                password: "Passwort1",
            },
        });

        assert.equal(signUp.status, 201);

        const response = await signIn("bob@example.com", "Passwort1");

        assert.equal(response.status, 403);
    });

    await t.test("lehnt doppelte Namen und E-Mails mit 409 ab", async () => {
        const sameEmail = await api("/auth/sign-up", {
            method: "POST",
            body: {
                name: "alice2",
                email: "ALICE@example.com",
                password: "Passwort1",
            },
        });

        assert.equal(sameEmail.status, 409);

        const sameName = await api("/auth/sign-up", {
            method: "POST",
            body: {
                name: "alice",
                email: "alice2@example.com",
                password: "Passwort1",
            },
        });

        assert.equal(sameName.status, 409);
    });

    await t.test("wendet Name- und Passwortregeln beim Signup an", async () => {
        const shortName = await api("/auth/sign-up", {
            method: "POST",
            body: {
                name: "Al",
                email: "al@example.com",
                password: "Passwort1",
            },
        });

        assert.equal(shortName.status, 400);

        const invalidName = await api("/auth/sign-up", {
            method: "POST",
            body: {
                name: "alice!",
                email: "alice3@example.com",
                password: "Passwort1",
            },
        });

        assert.equal(invalidName.status, 400);

        const weakPassword = await api("/auth/sign-up", {
            method: "POST",
            body: {
                name: "weak",
                email: "weak@example.com",
                password: "ohnenumer",
            },
        });

        assert.equal(weakPassword.status, 400);

        const invalidEmail = await api("/auth/sign-up", {
            method: "POST",
            body: {
                name: "emailformat",
                email: "keine-mail",
                password: "Passwort1",
            },
        });

        assert.equal(invalidEmail.status, 400);
    });

    await t.test("normalisiert die E-Mail beim Signup", async () => {
        const response = await api("/auth/sign-up", {
            method: "POST",
            body: {
                name: "upper",
                email: "UPPER@Example.COM",
                password: "Passwort1",
            },
        });

        assert.equal(response.status, 201);

        const user = await users.findOne({ name: "upper" });

        assert.equal(user!.email, "upper@example.com");
    });

    await t.test("behandelt Leerzeichen im Passwort exakt", async () => {
        const signUp = await api("/auth/sign-up", {
            method: "POST",
            body: {
                name: "spacer",
                email: "spacer@example.com",
                password: " Passwort1",
            },
        });

        assert.equal(signUp.status, 201);

        await users.updateOne(
            { email: "spacer@example.com" },
            { $set: { emailVerified: true } }
        );

        const exact = await signIn("spacer@example.com", " Passwort1");

        assert.equal(exact.status, 200);

        const trimmed = await signIn("spacer@example.com", "Passwort1");

        assert.equal(trimmed.status, 401);
    });

    await t.test("erneuert Access-Tokens über das Refresh-Cookie", async () => {
        const missing = await api("/auth/refresh", { method: "POST" });

        assert.equal(missing.status, 401);

        const valid = await api("/auth/refresh", {
            method: "POST",
            cookie: aliceCookie,
        });

        assert.equal(valid.status, 200);
        assert.ok(valid.body.accessToken);

        const invalid = await api("/auth/refresh", {
            method: "POST",
            cookie: "refreshToken=kaputt",
        });

        assert.equal(invalid.status, 401);
    });

    await t.test("schützt /users/me mit dem Access-Token", async () => {
        const authorized = await api("/users/me", { token: aliceToken });

        assert.equal(authorized.status, 200);
        assert.equal(authorized.body.email, "alice@example.com");
        assert.equal(authorized.body.name, "alice");

        const unauthorized = await api("/users/me");

        assert.equal(unauthorized.status, 401);
    });

    await t.test("vergibt Reset-Tokens unabhängig von der Schreibweise", async () => {
        const unknown = await api("/auth/forgot-password", {
            method: "POST",
            body: { email: "niemand@example.com" },
        });

        assert.equal(unknown.status, 200);
        assert.match(unknown.body.message, /If an account/);

        const mark = server.output().length;
        const response = await api("/auth/forgot-password", {
            method: "POST",
            body: { email: "ALICE@EXAMPLE.COM" },
        });

        assert.equal(response.status, 200);

        const user = await users.findOne({ email: "alice@example.com" });

        assert.ok(user!.passwordResetTokenHash, "Reset-Token wurde nicht gesetzt");

        const match = await server.waitForLog(
            mark,
            /\/reset-password\?token=([a-f0-9]{64})/
        );

        resetToken = match[1];
    });

    await t.test("erzwingt die Passwort-Policy beim Reset", async () => {
        const weak = await api("/auth/reset-password", {
            method: "POST",
            body: { token: resetToken, password: "a" },
        });

        assert.equal(weak.status, 400);

        const invalid = await api("/auth/reset-password", {
            method: "POST",
            body: { token: "0".repeat(64), password: "NeuesPasswort1" },
        });

        assert.equal(invalid.status, 400);
    });

    await t.test("setzt das Passwort zurück und entwertet den Token", async () => {
        const response = await api("/auth/reset-password", {
            method: "POST",
            body: { token: resetToken, password: "NeuesPasswort1" },
        });

        assert.equal(response.status, 200);

        const oldPassword = await signIn("alice@example.com", "Passwort1");

        assert.equal(oldPassword.status, 401);

        const newPassword = await signIn("alice@example.com", "NeuesPasswort1");

        assert.equal(newPassword.status, 200);

        aliceToken = newPassword.body.accessToken;

        const reused = await api("/auth/reset-password", {
            method: "POST",
            body: { token: resetToken, password: "NochEinPasswort1" },
        });

        assert.equal(reused.status, 400);

        const user = await users.findOne({ email: "alice@example.com" });

        assert.equal(user!.passwordResetTokenHash, undefined);
    });

    await t.test("versendet Verifikationsmails erneut", async () => {
        const response = await api("/auth/verify-email/resend", {
            method: "POST",
            body: { email: "BOB@example.com" },
        });

        assert.equal(response.status, 200);
        assert.match(response.body.message, /If an account exists/);

        const bob = await users.findOne({ email: "bob@example.com" });

        assert.ok(bob!.emailTokenHash);

        const unknown = await api("/auth/verify-email/resend", {
            method: "POST",
            body: { email: "niemand@example.com" },
        });

        assert.equal(unknown.status, 200);
    });

    await t.test("validiert Account-Änderungen", async () => {
        const noChanges = await api("/account", {
            method: "PATCH",
            token: aliceToken,
        });

        assert.equal(noChanges.status, 400);

        const unknownField = await api("/account", {
            method: "PATCH",
            token: aliceToken,
            body: { role: "admin" },
        });

        assert.equal(unknownField.status, 400);

        const shortName = await api("/account", {
            method: "PATCH",
            token: aliceToken,
            body: { name: "Al" },
        });

        assert.equal(shortName.status, 400);

        const weakPassword = await api("/account", {
            method: "PATCH",
            token: aliceToken,
            body: { password: "kurz" },
        });

        assert.equal(weakPassword.status, 400);
        assert.equal(
            weakPassword.body.message,
            "Password must be between 8 and 128 characters long"
        );
    });

    await t.test("lehnt vergebene Namen ab", async () => {
        const response = await api("/account", {
            method: "PATCH",
            token: aliceToken,
            body: { name: "bob" },
        });

        assert.equal(response.status, 200);
        assert.equal(response.body.errorMessages.name, "Name is already taken.");
        assert.deepEqual(response.body.updated, []);
    });

    await t.test("ändert den Namen", async () => {
        const response = await api("/account", {
            method: "PATCH",
            token: aliceToken,
            body: { name: "alice-neu" },
        });

        assert.equal(response.status, 200);
        assert.equal(response.body.messages.name, "Name has been changed.");
        assert.deepEqual(response.body.updated, ["name"]);

        const login = await signIn("alice-neu", "NeuesPasswort1");

        assert.equal(login.status, 200);
    });

    await t.test("lehnt fremde und identische E-Mails ab", async () => {
        const taken = await api("/account", {
            method: "PATCH",
            token: aliceToken,
            body: { email: "BOB@example.com" },
        });

        assert.equal(taken.status, 200);
        assert.equal(
            taken.body.errorMessages.email,
            "This email address is already in use."
        );

        const unchanged = await users.findOne({ email: "alice@example.com" });

        assert.equal(unchanged!.pendingEmail, null);

        const identical = await api("/account", {
            method: "PATCH",
            token: aliceToken,
            body: { email: "ALICE@example.com" },
        });

        assert.equal(identical.status, 200);
        assert.equal(
            identical.body.errorMessages.email,
            "New email must differ from the current email."
        );
    });

    await t.test("startet den E-Mail-Wechsel und bestätigt ihn", async () => {
        const mark = server.output().length;
        const response = await api("/account", {
            method: "PATCH",
            token: aliceToken,
            body: { email: "alice.neu@example.com" },
        });

        assert.equal(response.status, 200);
        assert.equal(
            response.body.messages.email,
            "Confirmation for the new email has been sent."
        );

        const pending = await users.findOne({ email: "alice@example.com" });

        assert.equal(pending!.pendingEmail, "alice.neu@example.com");

        const match = await server.waitForLog(
            mark,
            /\/confirm-email-change\?token=([a-f0-9]{64})/
        );

        emailChangeToken = match[1];

        const missingToken = await api("/account/confirm-email");

        assert.equal(missingToken.status, 400);

        const wrongToken = await api(
            `/account/confirm-email?token=${"0".repeat(64)}`
        );

        assert.equal(wrongToken.status, 400);

        const confirmed = await api(
            `/account/confirm-email?token=${emailChangeToken}`
        );

        assert.equal(confirmed.status, 200);
        assert.equal(confirmed.body.newEmail, "alice.neu@example.com");

        const updated = await users.findOne({ email: "alice.neu@example.com" });

        assert.ok(updated);
        assert.equal(updated.pendingEmail, undefined);
        assert.equal(updated.pendingEmailToken, undefined);

        const login = await signIn("alice.neu@example.com", "NeuesPasswort1");

        assert.equal(login.status, 200);

        aliceToken = login.body.accessToken;
    });

    await t.test("ändert das Passwort über den Account-Endpunkt", async () => {
        const response = await api("/account", {
            method: "PATCH",
            token: aliceToken,
            body: { password: "FinalesPasswort1" },
        });

        assert.equal(response.status, 200);
        assert.equal(
            response.body.messages.password,
            "Password has been changed."
        );

        const oldPassword = await signIn("alice.neu@example.com", "NeuesPasswort1");

        assert.equal(oldPassword.status, 401);

        const newPassword = await signIn("alice.neu@example.com", "FinalesPasswort1");

        assert.equal(newPassword.status, 200);

        aliceToken = newPassword.body.accessToken;
    });

    await t.test("löscht das eigene Konto und schützt DELETE /users/me", async () => {
        const suffix = `${process.pid}_${Date.now()}`;
        const name = `delete_me_${suffix}`;
        const email = `delete_me_${suffix}@example.com`;
        const password = "Passwort1";

        const mark = server.output().length;
        const signUp = await api("/auth/sign-up", {
            method: "POST",
            body: { name, email, password },
        });

        assert.equal(signUp.status, 201);

        const verifyMatch = await server.waitForLog(
            mark,
            /\/verify-email\?token=([a-f0-9]{64})/
        );

        await api(`/auth/verify-email?token=${verifyMatch[1]}`);

        const login = await signIn(email, password);

        assert.equal(login.status, 200);

        const deleteToken = login.body.accessToken;

        const withoutToken = await api("/users/me", { method: "DELETE" });

        assert.equal(withoutToken.status, 401);

        const invalidToken = await api("/users/me", {
            method: "DELETE",
            token: "kaputt",
        });

        assert.equal(invalidToken.status, 401);

        const deleted = await api("/users/me", {
            method: "DELETE",
            token: deleteToken,
        });

        assert.equal(deleted.status, 200);
        assert.equal(deleted.body.message, "Account has been deleted.");
        assert.match(deleted.setCookie || "", /refreshToken=/);
        assert.match(deleted.setCookie || "", /Expires=/);

        const remaining = await users.findOne({ email });

        assert.equal(remaining, null);

        const repeated = await api("/users/me", {
            method: "DELETE",
            token: deleteToken,
        });

        assert.equal(repeated.status, 404);
        assert.equal(repeated.body.message, "Fail to delete account.");
    });

    await t.test("entfernt den öffentlichen GET /users/:id-Endpoint", async () => {
        const id = new ObjectId().toHexString();
        const response = await api(`/users/${id}`);

        assert.equal(response.status, 404);
        assert.match(response.contentType, /application\/json/);
        assert.equal(response.body.message, "Not found");
    });

    await t.test("meldet ab und liefert JSON-404", async () => {
        const signOut = await api("/auth/sign-out", {
            method: "POST",
            token: aliceToken,
        });

        assert.equal(signOut.status, 204);
        assert.match(signOut.setCookie || "", /refreshToken=/);

        const invalidSignOut = await api("/auth/sign-out", {
            method: "POST",
            token: "kaputt",
        });

        assert.equal(invalidSignOut.status, 401);

        const notFound = await api("/gibt-es-nicht");

        assert.equal(notFound.status, 404);
        assert.match(notFound.contentType, /application\/json/);
        assert.equal(notFound.body.message, "Not found");
    });
});
