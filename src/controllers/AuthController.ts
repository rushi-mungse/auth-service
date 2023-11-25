import { UserService } from "./../services/UserService";
import { NextFunction, Response } from "express";
import { RegisterUserRequest } from "../types";
import { Logger } from "winston";
import { Role } from "../constants";
import { validationResult } from "express-validator";

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
    ) {}
    async sendOtp(req: RegisterUserRequest, res: Response, next: NextFunction) {
        const { fullName, email, password } = req.body;
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
