/**
 * Any SMTP server, through nodemailer: Gmail with an App Password, Zoho, SES's
 * SMTP interface. The transport is pooled for the life of the process, and its
 * timeouts are tightened from nodemailer's defaults of minutes, which outlive
 * any serverless function they run in.
 */
import "server-only";
import nodemailer from "nodemailer";
import { ENV } from "@/lib/env";
import type { TransportType } from "./types";

/** Null when SMTP is not fully configured, so the next transport, or the log, is used. */
export function smtpTransport(): TransportType | null {
  const {
    SMTP_HOST: host,
    SMTP_PORT: port = "465",
    SMTP_USER: user,
    SMTP_PASS: pass,
  } = ENV;
  if (!host || !user || !pass) return null;

  const transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: port === "465",
    auth: { user, pass },
    pool: true,
    maxConnections: 2,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });

  return async (mail) => {
    try {
      await transporter.sendMail(mail);
    } catch (error) {
      throw new Error(
        `The SMTP server refused the mail. Check SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASS.`,
        { cause: error },
      );
    }
  };
}
