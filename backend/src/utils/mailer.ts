import nodemailer from 'nodemailer';
import type { Options as SmtpOptions } from 'nodemailer/lib/smtp-transport/index.js';
import config from '../config/index.js';
import logger from './logger.js';

interface MailInput {
    to: string;
    subject: string;
    html: string;
    url: string;
}

interface MailResult {
    delivered: boolean;
    logged?: boolean;
    messageId?: string;
}

const baseUrl = String(config.clientBaseUrl || "").replace(/\/+$/, "");

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
    if (transporter) {
        return transporter;
    }

    const options: SmtpOptions = {
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpSecure,
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 10000,
    };

    if (config.smtpUser || config.smtpPass) {
        options.auth = {
            user: config.smtpUser as string,
            pass: config.smtpPass as string,
        };
    }

    transporter = nodemailer.createTransport(options);

    return transporter;
}

/**
 * In Development ohne SMTP-Konfiguration wird die Mail nicht versendet,
 * sondern inklusive Link geloggt. In Production ist SMTP Pflicht.
 */
function isDevLogFallback(): boolean {
    return !config.smtpHost && config.env !== "production";
}

async function sendMail({ to, subject, html, url }: MailInput): Promise<MailResult> {
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

function sendVerificationEmail({ email, token }: { email: string; token: string }): Promise<MailResult> {
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

function sendPasswordResetEmail({ email, token }: { email: string; token: string }): Promise<MailResult> {
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

function sendEmailChangeEmail({ email, token }: { email: string; token: string }): Promise<MailResult> {
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

export default {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendEmailChangeEmail,
};
