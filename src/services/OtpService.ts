import createHttpError from "http-errors";
import { Config, SmtpServer } from "../config";
import crypto from "crypto";

export default class OtpService {
    generateOtp() {
        return crypto.randomInt(1000, 9999);
    }

    async sendOtpByMail(email: string, html: string) {
        await SmtpServer.sendMail({
            from: `Team FUDO <${Config.MAIL_USER}>`,
            to: email,
            subject: "FUDO Verify OTP",
            text: "Hello ✔",
            html,
        });
    }

    hashData(data: string) {
        if (!Config.HASH_SECRET)
            throw createHttpError(500, "HASH_SECRET is not found!");
        return crypto
            .createHmac("sha256", Config.HASH_SECRET)
            .update(data)
            .digest("hex");
    }
}
