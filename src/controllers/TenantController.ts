import { NextFunction, Request, Response } from "express";
import { Tenant, TenantRequest } from "../types";
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

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const tenants = await this.tenantService.getAll();
            if (!tenants) return res.json({ tenants: [] });
            return res.json({ tenants });
        } catch (error) {
            return next(error);
        }
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.params.id;
        if (isNaN(Number(tenantId))) {
            return next(createHttpError(400, "Invalid url param!"));
        }

        try {
            const tenant = await this.tenantService.getById(Number(tenantId));
            if (!tenant) return res.json({ tenant: null });
            return res.json({ tenant: new TenantDto(tenant) });
        } catch (error) {
            return next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        const tenatnId = req.params.id;
        if (isNaN(Number(tenatnId))) {
            return next(createHttpError(400, "Invalid id param!"));
        }

        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ error: result.array() });
        }

        const tenant = req.body as Tenant;

        try {
            const tenant = await this.tenantService.getById(Number(tenatnId));
            if (!tenant)
                return next(createHttpError(400, "Tenant record not found!"));
        } catch (error) {
            return next(error);
        }

        try {
            await this.tenantService.update(Number(tenatnId), {
                name: tenant.name,
                address: tenant.address,
                rating: tenant.id,
            });

            const updatedTenant = await this.tenantService.getById(
                Number(tenatnId),
            );

            if (!updatedTenant)
                return next(createHttpError(400, "Tenant record not found!"));

            return res.json({ tenant: new TenantDto(updatedTenant) });
        } catch (error) {
            return next(error);
        }
    }
}
