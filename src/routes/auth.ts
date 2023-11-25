import express, { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/appDataSource";
import logger from "../config/logger";
import { User } from "../entity/User";
import { UserService } from "../services/UserService";
import { AuthController } from "./../controllers/AuthController";
import registerValidator from "../validators/registerValidator";

const router = express.Router();

// Dependancy Injection (Constructor Injection)
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository, logger);
const authController = new AuthController(userService, logger);

router.post(
    "/register",
    registerValidator,
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    (req: Request, res: Response, next: NextFunction) =>
        authController.register(req, res, next),
);

export default router;
