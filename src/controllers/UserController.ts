import { NextFunction, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { UpdateUserRequest } from "../types";
import { TenantService, UserService } from "../services";

export default class UserController {
    constructor(
        private tenantService: TenantService,
        private userService: UserService,
    ) {}

    async update(req: UpdateUserRequest, res: Response, next: NextFunction) {
        const userId = req.params?.id;
        if (isNaN(Number(userId))) {
            return next(createHttpError(400, "Invalid id param!"));
        }

        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ error: result.array() });
        }

        const { fullName, tenantId, role } = req.body;

        if (tenantId !== "null" && isNaN(Number(tenantId))) {
            return next(createHttpError(400, "Invalid id param!"));
        }

        try {
            const user = (
                await this.userService.findWithRelation(Number(userId))
            )[0];
            if (!user) {
                return next(createHttpError(400, "User not fount!"));
            }

            if (tenantId !== "null") {
                const tenant = await this.tenantService.getById(
                    Number(tenantId),
                );

                if (tenant) {
                    user.role = role;
                    user.fullName = fullName;
                    user.tenant = tenant;
                    await this.userService.save(user);
                } else {
                    return next(createHttpError(400, "Tenant not fount!"));
                }
            }
            return res.json({ id: user.id });
        } catch (error) {
            return next(error);
        }
    }
}
