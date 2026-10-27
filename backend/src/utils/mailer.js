const nodemailer = require("nodemailer");
const config = require("../config");
const logger = require("./logger");

const baseUrl = String(config.clientBaseUrl || "").replace(/\/+$/, "");

let transporter = null;

function getTransporter() {
    if (transporter) {
        return transporter;
    }

    const options = {
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpSecure,
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 10000,
    };

    if (config.smtpUser || config.smtpPass) {
        options.auth = {
            user: config.smtpUser,
            pass: config.smtpPass,
        };
    }

    transporter = nodemailer.createTransport(options);

    return transporter;
}

/**
 * In Development ohne SMTP-Konfiguration wird die Mail nicht versendet,
 * sondern inklusive Link geloggt. In Production ist SMTP Pflicht.
 */
function isDevLogFallback() {
    return !config.smtpHost && config.env !== "production";
}

async function sendMail({ to, subject, html, url }) {
    if (isDevLogFallback()) {
        logger.info(
            { mail: { to, subject, url } },
            "SMTP is not configured, mail was logged instead of sent"
        );

        return { delivered: false, logged: true };
    }

    if (!config.smtpHost) {
        throw new Error("SMTP is not configured");
    }

    try {
        const info = await getTransporter().sendMail({
            from: config.mailFrom,
            to,
            subject,
            html,
        });

        return { delivered: true, messageId: info.messageId };
    }
    catch (err) {
        logger.error({ err, mail: { to, subject } }, "Failed to send mail");
        throw err;
    }
}

function sendVerificationEmail({ email, token }) {
    const url = `${baseUrl}/auth/verify-email?token=${token}`;

    return sendMail({
        to: email,
        subject: "Verify your email address",
        url,
        html: `
            <h1>Verify your email</h1>
            <p>Click the link below to verify your email address:</p>
            <a href="${url}">${url}</a>
        `,
    });
}

function sendPasswordResetEmail({ email, token }) {
    const url = `${baseUrl}/auth/reset-password?token=${token}`;

    return sendMail({
        to: email,
        subject: "Reset your password",
        url,
        html: `
            <h1>Reset your password</h1>
            <p>Click the link below to reset your password:</p>
            <a href="${url}">${url}</a>
        `,
    });
}

function sendEmailChangeEmail({ email, token }) {
    const url = `${baseUrl}/auth/confirm-email-change?token=${token}`;

    return sendMail({
        to: email,
        subject: "Verify your new email address",
        url,
        html: `
            <h1>Verify your new email address</h1>
            <p>Click the link below to confirm the change:</p>
            <a href="${url}">${url}</a>
        `,
    });
}

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendEmailChangeEmail,
};
