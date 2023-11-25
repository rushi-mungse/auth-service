import { UserService } from "./../services/UserService";
import { NextFunction, Response } from "express";
import { RegisterUserRequest } from "../types";
import { Logger } from "winston";
import { Role } from "../constants";

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
    ) {}
    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        const { fullName, email, password } = req.body;
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
