import { NextFunction, Response, Request } from "express";
import { AuthCookie } from "../types";
import { TokenService } from "../services";
import { AppDataSource } from "../config";
import { RefreshToken } from "../entity";
import createHttpError from "http-errors";

const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const tokenService = new TokenService(refreshTokenRepository);

/* if  user is unauthorized then pass next */
export default function (req: Request, res: Response, next: NextFunction) {
    const { refreshToken } = req.cookies as AuthCookie;
    if (!refreshToken) return next();
    try {
        const token = tokenService.verifyRefreshToken(refreshToken);
        if (token) return next(createHttpError(400, "User already login!"));
        return next();
    } catch (error) {
        return next(createHttpError(500, "Internal Server Error!"));
    }
}
