import { spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import net from 'node:net';
import type { AddressInfo } from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MongoClient } from 'mongodb';
import type { Db } from 'mongodb';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

const MONGO_URI = process.env.TEST_MONGO_URI || "mongodb://127.0.0.1:27017";

function getFreePort(): Promise<number> {
    return new Promise((resolve, reject) => {
        const server = net.createServer();

        server.unref();
        server.on("error", reject);
        server.listen(0, "127.0.0.1", () => {
            const { port } = server.address() as AddressInfo;

            server.close(() => resolve(port));
        });
    });
}

interface WaitOptions {
    timeout?: number;
    interval?: number;
    message?: string;
}

function waitFor(predicate: () => boolean, { timeout = 15000, interval = 25, message }: WaitOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
        const startedAt = Date.now();

        const tick = () => {
            if (predicate()) {
                resolve();
                return;
            }

            if (Date.now() - startedAt > timeout) {
                reject(new Error(message || "Timeout while waiting for condition"));
                return;
            }

            setTimeout(tick, interval);
        };

        tick();
    });
}

export interface TestServer {
    port: number;
    baseUrl: string;
    db: Db;
    client: MongoClient;
    child: ChildProcess;
    output: () => string;
    waitForLog: (startIndex: number, pattern: RegExp, timeout?: number) => Promise<RegExpMatchArray>;
    close: () => Promise<void>;
}

/**
 * Startet den echten Server als Child-Process gegen eine temporäre Datenbank.
 * So werden Bootstrap, Middleware-Reihenfolge und Mongo-Indizes mitgetestet.
 */
async function startTestServer(): Promise<TestServer> {
    const port = await getFreePort();
    const dbName = `fullstack_template_test_${process.pid}_${Date.now()}`;
    const backendDir = path.resolve(currentDir, "../..");

    const client = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 5000 });

    try {
        await client.connect();
        await client.db(dbName).command({ ping: 1 });
    }
    catch {
        await client.close().catch(() => {});
        throw new Error(
            `MongoDB ist nicht erreichbar (${MONGO_URI}). Bitte vor dem Test starten.`
        );
    }

    const db = client.db(dbName);

    const child = spawn(process.execPath, ["--import", "tsx", "main.ts"], {
        cwd: backendDir,
        env: {
            ...process.env,
            NODE_ENV: "test",
            LOG_LEVEL: "debug",
            PORT: String(port),
            MONGO_URI,
            DB_NAME: dbName,
            JWT_ACCESS_SECRET: "test_access_secret",
            JWT_REFRESH_SECRET: "test_refresh_secret",
            ACCESS_TOKEN_EXPIRES_IN: "1h",
            REFRESH_TOKEN_EXPIRES_IN: "7d",
            BCRYPT_SALT_ROUNDS: "4",
            CLIENT_BASE_URL: "http://localhost:5173",
            // Empty values keep dotenv from loading a real SMTP config.
            SMTP_HOST: "",
            SMTP_PORT: "",
            SMTP_SECURE: "",
            SMTP_USER: "",
            SMTP_PASS: "",
            MAIL_FROM: "",
        },
        stdio: ["ignore", "pipe", "pipe"],
    });

    let output = "";
    let exitCode: number | null = null;

    child.stdout?.on("data", (chunk: Buffer) => {
        output += chunk.toString();
    });
    child.stderr?.on("data", (chunk: Buffer) => {
        output += chunk.toString();
    });
    child.on("exit", (code) => {
        exitCode = code;
    });

    async function cleanup(): Promise<void> {
        if (child.exitCode === null && child.signalCode === null) {
            child.kill("SIGKILL");
        }

        await db.dropDatabase().catch(() => {});
        await client.close().catch(() => {});
    }

    try {
        await waitFor(
            () => output.includes("Server running on port") || exitCode !== null,
            { message: "Server ist nicht gestartet" }
        );
    }
    catch (err) {
        await cleanup();
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(`${message}:\n${output}`);
    }

    if (exitCode !== null) {
        await cleanup();
        throw new Error(`Server wurde mit Code ${exitCode} beendet:\n${output}`);
    }

    return {
        port,
        baseUrl: `http://127.0.0.1:${port}`,
        db,
        client,
        child,
        output: () => output,

        /**
         * Wartet auf einen Log-Eintrag ab `startIndex`. Pino schreibt über einen
         * Worker, daher kann der Logeintrag nach der HTTP-Antwort eintreffen.
         */
        async waitForLog(startIndex: number, pattern: RegExp, timeout = 5000): Promise<RegExpMatchArray> {
            let match: RegExpMatchArray | null = null;

            await waitFor(
                () => {
                    match = output.slice(startIndex).match(pattern);

                    return Boolean(match);
                },
                {
                    timeout,
                    message: `Log-Eintrag ${pattern} nicht gefunden`,
                }
            );

            return match as unknown as RegExpMatchArray;
        },

        async close(): Promise<void> {
            if (child.exitCode === null && child.signalCode === null) {
                child.kill("SIGTERM");

                await new Promise<void>((resolve) => {
                    const timer = setTimeout(() => {
                        child.kill("SIGKILL");
                        resolve();
                    }, 5000);

                    timer.unref();

                    child.once("exit", () => {
                        clearTimeout(timer);
                        resolve();
                    });
                });
            }

            await db.dropDatabase().catch(() => {});
            await client.close().catch(() => {});
        },
    };
}

export default { startTestServer };
