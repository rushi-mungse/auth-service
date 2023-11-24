import { UserService } from "../services/UserService";
import { AuthController } from "./../controllers/AuthController";
import express from "express";

const router = express.Router();
const userService = new UserService();
const authController = new AuthController(userService);

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post("/register", (req, res, next) =>
    authController.register(req, res, next),
);

export default router;
