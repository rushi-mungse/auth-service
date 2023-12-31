import {
    UserService,
    OtpService,
    TokenService,
    CredentialService,
    NotificationService,
} from "./../services";
import { NextFunction, Response } from "express";
import {
    AuthRequest,
    ForgetPasswordRequest,
    LoginRequest,
    SendOtpRequest,
    SetPasswordRequest,
    VerifyOtpRequest,
} from "../types";
import { Logger } from "winston";
import { Role } from "../constants";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { JwtPayload } from "jsonwebtoken";
import { UserDto } from "../dtos";

export default class AuthController {
    constructor(
        private userService: UserService,
        private credentialService: CredentialService,
        private otpService: OtpService,
        private tokenService: TokenService,
        private notificationService: NotificationService,
        private logger: Logger,
    ) {}

    async sendOtp(req: SendOtpRequest, res: Response, next: NextFunction) {
        // validate user data send from user
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ error: result.array() });
        }

        const { fullName, email, password, confirmPassword } = req.body;

        this.logger.info({
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
            // await this.notificationService.sendOtpByMail(email, "<h1>Hello</h1>");

            // prepare hash data
            const data = `${otp}.${email}.${expires}.${hashPassword}`;
            const hashData = this.otpService.hashData(data);

            // generate hash otp
            const hashOtp = `${hashData}#${expires}#${hashPassword}`;

            // TODO: remove otp property afrer developemnt
            return res.status(200).json({ email, hashOtp, fullName, otp });
        } catch (error) {
            return next(error);
        }
    }

    async verifyOtp(req: VerifyOtpRequest, res: Response, next: NextFunction) {
        // validate user data send from user
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ error: result.array() });
        }

        const { fullName, email, hashOtp, otp } = req.body;
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
            const hashData = this.otpService.hashData(data);

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
                tenant: null,
            });
        } catch (error) {
            return next(error);
        }

        try {
            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            // generate access token using private key
            const accessToken = this.tokenService.generateAccessToken(payload);

            // store refresh token ref in db
            const storedRefreshTokenRef =
                await this.tokenService.createRefreshToken(user);

            // generate refresh token with jwtid (refresh token id)
            const refreshToken = this.tokenService.generateRefreshToken({
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
            return res.status(201).json({ user: new UserDto(user) });
        } catch (error) {
            return next(error);
        }
    }

    async self(req: AuthRequest, res: Response, next: NextFunction) {
        const id = Number(req.auth.sub);
        try {
            const user = (await this.userService.findWithRelation(id))[0];

            if (!user) {
                return next(createHttpError(400, "User not foune"));
            }

            return res.json({ user: new UserDto(user) });
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

    async login(req: LoginRequest, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ error: result.array() });
        }

        const { email, password } = req.body;

        let user;
        try {
            user = await this.userService.findUserByEmail(email);
            if (!user) {
                return next(
                    createHttpError(400, "Email or Password does not match!"),
                );
            }
        } catch (error) {
            return next(error);
        }

        try {
            const hashPassword = user.password;
            const newHashPassword = await this.credentialService.hashCompare(
                password,
                hashPassword,
            );

            if (!newHashPassword)
                return next(
                    createHttpError(400, "Email or Password does not match!"),
                );
        } catch (error) {
            return next(error);
        }

        try {
            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            // generate access token using private key
            const accessToken = this.tokenService.generateAccessToken(payload);

            // store refresh token ref in db
            const storedRefreshTokenRef =
                await this.tokenService.createRefreshToken(user);

            // generate refresh token with jwtid (refresh token id)
            const refreshToken = this.tokenService.generateRefreshToken({
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
        return res.json({ user: new UserDto(user) });
    }

    async refresh(req: AuthRequest, res: Response, next: NextFunction) {
        const jwtPayload = req.auth;
        let user;
        try {
            user = await this.userService.findUserById(Number(jwtPayload.sub));
            if (!user) {
                return next(createHttpError(400, "User not found!"));
            }
        } catch (error) {
            return next(error);
        }

        try {
            await this.tokenService.deleteRefreshTokenById(
                Number(jwtPayload.id),
            );
        } catch (error) {
            return next(error);
        }

        try {
            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            // generate access token using private key
            const accessToken = this.tokenService.generateAccessToken(payload);

            // store refresh token ref in db
            const storedRefreshTokenRef =
                await this.tokenService.createRefreshToken(user);

            // generate refresh token with jwtid (refresh token id)
            const refreshToken = this.tokenService.generateRefreshToken({
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

        return res.json({ user: new UserDto(user) });
    }

    async forgetPassword(
        req: ForgetPasswordRequest,
        res: Response,
        next: NextFunction,
    ) {
        const { email } = req.body;
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ error: result.array() });
        }

        try {
            const isUserExist = await this.userService.isUserExist(email);
            if (!isUserExist) {
                return next(
                    createHttpError(401, "This email is not registered!"),
                );
            }
        } catch (error) {
            return next(error);
        }

        // generate otp
        const ttl = 1000 * 60 * 10; /* 10 minute total time leave*/
        const expires = Date.now() + ttl;
        const otp = this.otpService.generateOtp();

        // send otp to user by email
        // TODO: fix html parameter
        // await this.notificationService.sendOtpByMail(email, "<h1>Hello</h1>");

        // prepare hash data
        const data = `${otp}.${email}.${expires}`;
        const hashData = this.otpService.hashData(data);

        // generate hash otp
        const hashOtp = `${hashData}#${expires}`;

        return res.json({ hashOtp, email, otp });
    }

    async setPassword(
        req: SetPasswordRequest,
        res: Response,
        next: NextFunction,
    ) {
        const { email, hashOtp, otp, password, confirmPassword } = req.body;

        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ error: result.array() });
        }

        // check comfirm password and password is match
        if (password !== confirmPassword) {
            const err = createHttpError(
                400,
                "confirm password not match to password!",
            );
            return next(err);
        }

        let user;
        try {
            user = await this.userService.findUserByEmail(email);
            if (!user) {
                return next(
                    createHttpError(401, "This email is not registered!"),
                );
            }
        } catch (error) {
            return next(error);
        }

        // check hash otp is valid
        if (hashOtp.split("#").length !== 2) {
            const error = createHttpError(400, "Otp is invalid!");
            return next(error);
        }

        // verify otp and hash otp
        const [prevHashedOtp, expires] = hashOtp.split("#");
        try {
            if (Date.now() > +expires) {
                const error = createHttpError(408, "Otp is expired!");
                return next(error);
            }

            // prepare hash data
            const data = `${otp}.${email}.${expires}`;
            const hashData = this.otpService.hashData(data);

            if (hashData !== prevHashedOtp) {
                const error = createHttpError(400, "Otp is invalid!");
                return next(error);
            }
        } catch (error) {
            return next(error);
        }

        try {
            const hashPassword =
                await this.credentialService.hashData(password);
            await this.userService.updateUserPassword(user.id, hashPassword);
            return res.json({ user: new UserDto(user) });
        } catch (error) {
            return next(error);
        }
    }
}
