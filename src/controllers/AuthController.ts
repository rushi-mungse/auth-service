import { CredentialService } from "./../services/CredentialService";
import { UserService } from "./../services/UserService";
import { NextFunction, Response } from "express";
import { RegisterUserRequest } from "../types";
import { Logger } from "winston";
import { Role } from "../constants";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { OtpService } from "../services/OtpService";

export class AuthController {
    constructor(
        private userService: UserService,
        private credentialService: CredentialService,
        private otpService: OtpService,
        private logger: Logger,
    ) {}

    async sendOtp(req: RegisterUserRequest, res: Response, next: NextFunction) {
        const { fullName, email, password, confirmPassword } = req.body;

        // validate user data send from user
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(404).json({ error: result.array() });
        }

        this.logger.debug({
            fullName,
            email,
            password: "********",
            confirmPassword: "********",
            role: Role.CUSTOMER,
        });

        // check comfirm password and password is match
        if (password !== confirmPassword) {
            const err = createHttpError(
                400,
                "confirm password not match to password!",
            );
            return next(err);
        }

        // user already exist means user already register then return 409(confict)
        try {
            const isUser = await this.userService.isUserExist(email);
            if (isUser) {
                const error = createHttpError(
                    409,
                    "This email is already exist!",
                );
                return next(error);
            }
        } catch (error) {
            return next(error);
        }

        try {
            // generate hash password
            const hashPassword =
                await this.credentialService.hashData(password);

            // generate otp
            const ttl = 1000 * 60 * 10; /* 10 minute total time leave*/
            const expires = Date.now() + ttl;
            const otp = this.otpService.generateOtp();

            // send otp to user by email
            // TODO: fix html parameter
            // await this.otpService.sendOtpByMail(email, "<h1>Hello</h1>");

            // prepare hash data
            const data = `${otp}.${email}.${expires}`;
            const hashData = this.otpService.hashOtp(data);

            // generate hash otp
            const hashOtp = `${hashData}.${expires}.${hashPassword}`;

            // TODO: remove otp property afrer developemnt
            return res.status(201).json({ email, hashOtp, fullName, otp });
        } catch (error) {
            return next(error);
        }
    }
}
