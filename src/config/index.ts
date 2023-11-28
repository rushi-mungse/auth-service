import { config } from "dotenv";
import path from "path";
config({ path: path.join(__dirname, `../../.env.${process.env.NODE_ENV}`) });

const {
    PORT,
    NODE_ENV,
    DB_HOST,
    DB_USERNAME,
    DB_PASSWORD,
    DB_NAME,
    DB_PORT,
    HASH_SECRET,
    SMTP_HOST,
    SMTP_PORT,
    MAIL_USER,
    MAIL_PASSWORD,
    REFRESH_TOKEN_SECRET,
    JWKS_URI,
} = process.env;

export const Config = {
    PORT,
    NODE_ENV,
    DB_HOST,
    DB_USERNAME,
    DB_PASSWORD,
    DB_NAME,
    DB_PORT,
    HASH_SECRET,
    SMTP_HOST,
    SMTP_PORT,
    MAIL_USER,
    MAIL_PASSWORD,
    REFRESH_TOKEN_SECRET,
    JWKS_URI,
};
