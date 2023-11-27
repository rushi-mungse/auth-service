import { CredentialService } from "./../services/CredentialService";
import { UserService } from "./../services/UserService";
import { NextFunction, Response } from "express";
import { SendOtpRequest, VerifyOtpRequest } from "../types";
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

    async sendOtp(req: SendOtpRequest, res: Response, next: NextFunction) {
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
            const hashOtp = `${hashData}#${expires}#${hashPassword}`;

            // TODO: remove otp property afrer developemnt
            return res.status(200).json({ email, hashOtp, fullName, otp });
        } catch (error) {
            return next(error);
        }
    }

    async verifyOtp(req: VerifyOtpRequest, res: Response, next: NextFunction) {
        const { fullName, email, hashOtp, otp } = req.body;

        // validate user data send from user
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(404).json({ error: result.array() });
        }

        // check user already exist
        try {
            const isUser = await this.userService.isUserExist(email);
            if (isUser) {
                const error = createHttpError(
                    409,
                    "This email is already registered!",
                );
                return next(error);
            }
        } catch (error) {
            return next(error);
        }

        // check hash otp is valid
        if (hashOtp.split("#").length !== 3) {
            const error = createHttpError(400, "Otp is invalid!");
            return next(error);
        }

        // verify otp and hash otp
        const [prevHashedOtp, expires, hashPassword] = hashOtp.split("#");
        try {
            if (Date.now() > +expires) {
                const error = createHttpError(408, "Otp is expired!");
                return next(error);
            }

            // prepare hash data
            const data = `${otp}.${email}.${expires}`;
            const hashData = this.otpService.hashOtp(data);

            if (hashData !== prevHashedOtp) {
                const error = createHttpError(400, "Otp is invalid!");
                return next(error);
            }
        } catch (error) {
            return next(error);
        }

        // TODO: set jwt tokens in cookies
        const accessToken = "dsflsjdfkslf";
        const refreshToken = "adfjdsflskfls";

        res.cookie("accessToken", accessToken, {
            domain: "localhost",
            sameSite: "strict",
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 /* 24 hourse */,
        });

        res.cookie("refreshToken", refreshToken, {
            domain: "localhost",
            sameSite: "strict",
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365 /* 1 year */,
        });

        // TODO: store refresh token in database
        // TODO: create user

        // register user
        try {
            const user = await this.userService.create({
                fullName,
                email,
                password: hashPassword,
                role: Role.CUSTOMER,
            });
            return res.status(201).json({ ...user, password: null });
        } catch (error) {
            return next(error);
        }
    }
}
