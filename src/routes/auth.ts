import { AppDataSource } from "../config/appDataSource";
import logger from "../config/logger";
import { User } from "../entity/User";
import { UserService } from "../services/UserService";
import { AuthController } from "./../controllers/AuthController";
import express from "express";

const router = express.Router();

// Dependancy Injection (Constructor Injection)
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository, logger);
const authController = new AuthController(userService, logger);

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post("/register", (req, res, next) =>
    authController.register(req, res, next),
);

export default router;
