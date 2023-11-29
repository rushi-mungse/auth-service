import {
    OtpService,
    UserService,
    CredentialService,
    TokenService,
} from "./../services";
import express, {
    Request,
    Response,
    NextFunction,
    RequestHandler,
} from "express";
import { AppDataSource } from "../config";
import logger from "../config/logger";
import { User } from "../entity/User";
import { AuthController } from "./../controllers/AuthController";
import sendOtpValidator from "../validators/register/sendOtpValidator";
import verifyOtpValidator from "../validators/register/verifyOtpValidator";
import { RefreshToken } from "../entity/RefreshToken";
import accessTokenMiddleware from "../middlewares/accessTokenMiddleware";
import { AuthRequest } from "../types";
import refreshTokenMiddleware from "../middlewares/refreshTokenMiddleware";

const router = express.Router();

// Dependancy Injection (Constructor Injection)
const credentialService = new CredentialService();
const otpService = new OtpService();
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const tokenService = new TokenService(refreshTokenRepository);
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository, credentialService, logger);

const authController = new AuthController(
    userService,
    credentialService,
    otpService,
    tokenService,
    logger,
);

router.post(
    "/register/send-otp",
    sendOtpValidator,
    (req: Request, res: Response, next: NextFunction) =>
        authController.sendOtp(req, res, next) as unknown as RequestHandler,
);

router.post(
    "/register/verify-otp",
    verifyOtpValidator,
    (req: Request, res: Response, next: NextFunction) =>
        authController.verifyOtp(req, res, next) as unknown as RequestHandler,
);

router.get(
    "/self",
    accessTokenMiddleware as RequestHandler,
    (req: Request, res: Response, next: NextFunction) =>
        authController.self(
            req as AuthRequest,
            res,
            next,
        ) as unknown as RequestHandler,
);

router.get(
    "/logout",
    [
        accessTokenMiddleware as RequestHandler,
        refreshTokenMiddleware as RequestHandler,
    ],
    (req: Request, res: Response, next: NextFunction) =>
        authController.logout(
            req as AuthRequest,
            res,
            next,
        ) as unknown as RequestHandler,
);

export default router;
