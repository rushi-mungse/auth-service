import express, {
    NextFunction,
    Request,
    RequestHandler,
    Response,
} from "express";
import { UserController } from "../controllers";
import { accessTokenMiddleware, canAccess } from "../middlewares";
import { Role } from "../constants";
import { updateUserValidator } from "../validators";
import { CredentialService, TenantService, UserService } from "../services";
import appDataSource from "../config/appDataSource";
import { Tenant, User } from "../entity";
import { logger } from "../config";
import { UpdateUserRequest } from "../types";
const router = express.Router();

const userRpository = appDataSource.getRepository(User);
const tenantRpository = appDataSource.getRepository(Tenant);
const credentialService = new CredentialService();
const tenantService = new TenantService(tenantRpository);
const userService = new UserService(userRpository, credentialService, logger);
const userController = new UserController(tenantService, userService);

router.put(
    "/:id",
    updateUserValidator,
    [accessTokenMiddleware, canAccess([Role.ADMIN])],
    (req: Request, res: Response, next: NextFunction) =>
        userController.update(
            req as UpdateUserRequest,
            res,
            next,
        ) as unknown as RequestHandler,
);

router.delete(
    "/:id",
    [accessTokenMiddleware, canAccess([Role.ADMIN])],
    (req: Request, res: Response, next: NextFunction) =>
        userController.delete(req, res, next) as unknown as RequestHandler,
);

router.get(
    "/:id",
    [accessTokenMiddleware, canAccess([Role.ADMIN])],
    (req: Request, res: Response, next: NextFunction) =>
        userController.getOne(req, res, next) as unknown as RequestHandler,
);

router.get(
    "/",
    [accessTokenMiddleware, canAccess([Role.ADMIN])],
    (req: Request, res: Response, next: NextFunction) =>
        userController.getAll(req, res, next) as unknown as RequestHandler,
);

export default router;
