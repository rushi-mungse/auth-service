import express, {
    NextFunction,
    Request,
    RequestHandler,
    Response,
} from "express";
import { TenantController } from "../controllers";
import { TenantRequest } from "../types";
import { TenantService } from "../services";
import { AppDataSource } from "../config";
import { Tenant } from "../entity";
import { tenantValidator } from "../validators";
import { accessTokenMiddleware, canAccess } from "../middlewares";
import { Role } from "../constants";
const router = express.Router();

const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService);

router.post(
    "/create",
    tenantValidator,
    [accessTokenMiddleware, canAccess([Role.ADMIN])],
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.create(
            req as TenantRequest,
            res,
            next,
        ) as unknown as RequestHandler,
);

router.delete(
    "/:id",
    [accessTokenMiddleware, canAccess([Role.ADMIN])],
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.delete(req, res, next) as unknown as RequestHandler,
);

router.get(
    "/",
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.getAll(req, res, next) as unknown as RequestHandler,
);

router.get(
    "/:id",
    [accessTokenMiddleware, canAccess([Role.ADMIN])],
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.getOne(req, res, next) as unknown as RequestHandler,
);

router.put(
    "/:id",
    tenantValidator,
    [accessTokenMiddleware, canAccess([Role.ADMIN])],
    (req: Request, res: Response, next: NextFunction) =>
        tenantController.update(req, res, next) as unknown as RequestHandler,
);

export default router;
