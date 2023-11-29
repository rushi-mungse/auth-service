import { Config } from ".";
import nodemailer from "nodemailer";

export default nodemailer.createTransport({
    host: Config.SMTP_HOST,
    port: Number(Config.SMTP_PORT),
    secure: false,
    auth: {
        user: Config.MAIL_USER,
        pass: Config.MAIL_PASSWORD,
    },
});
