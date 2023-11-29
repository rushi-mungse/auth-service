import express, {
    Request,
    Response,
    NextFunction,
    RequestHandler,
} from "express";
import {
    OtpService,
    UserService,
    CredentialService,
    TokenService,
} from "./../services";
import { AppDataSource, logger } from "../config";
import { User, RefreshToken } from "../entity";
import { accessTokenMiddleware, refreshTokenMiddleware } from "../middlewares";
import { AuthController } from "../controllers";
import { sendOtpValidator, verifyOtpValidator } from "../validators";
import { AuthRequest } from "../types";

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
