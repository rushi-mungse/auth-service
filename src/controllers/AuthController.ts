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

        if (password !== confirmPassword) {
            const err = createHttpError(
                400,
                "confirm password not match to password!",
            );
            return next(err);
        }

        try {
            const user = await this.userService.create({
                fullName,
                email,
                password,
                role: Role.CUSTOMER,
            });
            res.status(201).json({ id: user.id });
        } catch (error) {
            return next(error);
        }
    }
}
