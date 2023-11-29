import { OtpService } from "./../services/OtpService";
import express, {
    Request,
    Response,
    NextFunction,
    RequestHandler,
} from "express";
import { AppDataSource } from "../config/appDataSource";
import logger from "../config/logger";
import { User } from "../entity/User";
import { UserService } from "../services/UserService";
import { AuthController } from "./../controllers/AuthController";
import sendOtpValidator from "../validators/register/sendOtpValidator";
import { CredentialService } from "../services/CredentialService";
import verifyOtpValidator from "../validators/register/verifyOtpValidator";
import { TokenService } from "../services/TokenService";
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
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    (req: Request, res: Response, next: NextFunction) =>
        authController.sendOtp(req, res, next),
);

router.post(
    "/register/verify-otp",
    verifyOtpValidator,
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    (req: Request, res: Response, next: NextFunction) =>
        authController.verifyOtp(req, res, next),
);

router.get(
    "/self",
    accessTokenMiddleware as RequestHandler,
    (req: Request, res: Response, next: NextFunction) =>
        authController.self(
            req as AuthRequest,
            res,
            next,
        ) as unknown as AuthRequest,
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
        ) as unknown as AuthRequest,
);

export default router;
