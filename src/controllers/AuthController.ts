import { UserService } from "./../services/UserService";
import { NextFunction, Response } from "express";
import { RegisterUserRequest } from "../types";
import { Logger } from "winston";
import { Role } from "../constants";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";

export class AuthController {
    constructor(
        private userService: UserService,
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
            return res.status(201).json({ ok: true });
        } catch (error) {
            return next(error);
        }
    }
}
