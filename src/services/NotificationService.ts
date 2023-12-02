import { SmtpServer } from "../config";
import { Config } from "../config";

export default class NotificationService {
    async sendOtpByMail(email: string, html: string) {
        await SmtpServer.sendMail({
            from: `Team FUDO <${Config.MAIL_USER}>`,
            to: email,
            subject: "FUDO Verify OTP",
            text: "Hello ✔",
            html,
        });
    }
}
