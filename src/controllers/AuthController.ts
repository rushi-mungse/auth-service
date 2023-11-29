import { CredentialService } from "./../services/CredentialService";
import { UserService } from "./../services/UserService";
import { NextFunction, Response } from "express";
import { AuthRequest, SendOtpRequest, VerifyOtpRequest } from "../types";
import { Logger } from "winston";
import { Role } from "../constants";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { OtpService } from "../services/OtpService";
import { TokenService } from "../services/TokenService";
import { JwtPayload } from "jsonwebtoken";

export class AuthController {
    constructor(
        private userService: UserService,
        private credentialService: CredentialService,
        private otpService: OtpService,
        private tokenService: TokenService,
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
            const data = `${otp}.${email}.${expires}.${hashPassword}`;
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
            const data = `${otp}.${email}.${expires}.${hashPassword}`;
            const hashData = this.otpService.hashOtp(data);

            if (hashData !== prevHashedOtp) {
                const error = createHttpError(400, "Otp is invalid!");
                return next(error);
            }
        } catch (error) {
            return next(error);
        }

        // register user
        let user;
        try {
            user = await this.userService.createUser({
                fullName,
                email,
                password: hashPassword,
                role: Role.CUSTOMER,
            });
        } catch (error) {
            return next(error);
        }

        let accessToken;
        let refreshToken;

        try {
            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            // generate access token using private key
            accessToken = this.tokenService.generateAccessToken(payload);

            // store refresh token ref in db
            const storedRefreshTokenRef =
                await this.tokenService.createRefreshToken(user);

            // generate refresh token with jwtid (refresh token id)
            refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(storedRefreshTokenRef.id),
            });

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
        } catch (error) {
            return next(error);
        }

        // register user
        try {
            return res.status(201).json({ ...user, password: null });
        } catch (error) {
            return next(error);
        }
    }

    async self(req: AuthRequest, res: Response, next: NextFunction) {
        const id = Number(req.auth.sub);
        try {
            const user = await this.userService.findUserById(id);
            return res.json({ ...user, password: null });
        } catch (error) {
            return next(error);
        }
    }

    async logout(req: AuthRequest, res: Response, next: NextFunction) {
        const id = Number(req.auth.id);
        try {
            await this.tokenService.deleteRefreshTokenById(id);
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");
            return res.json({ user: null });
        } catch (error) {
            next(error);
        }
    }
}
