import { UserService } from "./../services/UserService";
import { NextFunction, Response } from "express";
import { RegisterUserRequest } from "../types";

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
            res.status(201).json({ msg: "ok" });
        } catch (error) {
            return next(error);
        }
    }
}
