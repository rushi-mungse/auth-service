import { NextFunction, Request, Response } from "express";
import { TenantRequest } from "../types";
import { TenantService } from "../services";
import { TenantDto } from "../dtos";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";

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

    async delete(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.params.id;

        if (isNaN(Number(tenantId))) {
            return next(createHttpError(400, "Invalid url param."));
        }

        try {
            await this.tenantService.deleteById(Number(tenantId));
            return res.json({ id: tenantId });
        } catch (error) {
            return next(error);
        }
    }
}
