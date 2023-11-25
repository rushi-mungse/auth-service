import crypto from "crypto";

export class OtpService {
    constructor() {}
    generateOtp() {
        return crypto.randomInt(1000, 9999);
    }

    async sendOtpByMail(email: string, html: string) {}

    async hashOtp() {}
}
