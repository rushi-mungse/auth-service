import { UserService } from "./../services/UserService";
import { NextFunction, Response } from "express";
import { RegisterUserRequest } from "../types";
import logger from "../config/logger";

export class AuthController {
    constructor(private userService: UserService) {}
    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        const { fullName, email, password } = req.body;
        try {
            const user = await this.userService.create({
                fullName,
                email,
                password,
            });
            logger.info(user);
            res.status(201).json({ msg: "ok" });
        } catch (error) {
            return next(error);
        }
    }
}
