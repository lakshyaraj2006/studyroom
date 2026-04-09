import { createTransport } from "nodemailer";

const NODEMAILER_HOST = process.env.NODEMAILER_HOST!;
const NODEMAILER_PORT = process.env.NODEMAILER_PORT!;
const NODEMAILER_USER = process.env.NODEMAILER_USER!;
const NODEMAILER_PASS = process.env.NODEMAILER_PASS!;

if (!NODEMAILER_HOST || !NODEMAILER_PORT || !NODEMAILER_USER || !NODEMAILER_PASS) {
    throw new Error("Missing nodmailer params");
}

export const transporter = createTransport({
    host: NODEMAILER_HOST,
    port: +NODEMAILER_PORT,
    auth: {
        user: NODEMAILER_USER,
        pass: NODEMAILER_PASS
    }
})