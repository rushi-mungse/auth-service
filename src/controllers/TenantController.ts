import { NextFunction, Response } from "express";
import { TenantRequest } from "../types";
import { TenantService } from "../services";
import { TenantDto } from "../dtos";
import { validationResult } from "express-validator";

export default class TenantController {
    constructor(private tenantService: TenantService) {}
    async create(req: TenantRequest, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ error: result.array() });
        }

        const { name, address } = req.body;
        try {
            const tenant = await this.tenantService.create({
                name,
                address,
                rating: 0,
            });
            return res.json({ tenant: new TenantDto(tenant) });
        } catch (error) {
            return next(error);
        }
    }
}
