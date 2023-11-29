import { Config } from "../config";
import crypto from "crypto";
import { transporter } from "../config/smtpSever";

export default class OtpService {
    generateOtp() {
        return crypto.randomInt(1000, 9999);
    }

    async sendOtpByMail(email: string, html: string) {
        await transporter.sendMail({
            from: `Team FUDO <${Config.MAIL_USER}>`,
            to: email,
            subject: "FUDO Verify OTP",
            text: "Hello ✔",
            html,
        });
    }

    hashOtp(data: string) {
        return crypto
            .createHmac("sha256", Config.HASH_SECRET!)
            .update(data)
            .digest("hex");
    }
}
