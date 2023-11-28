import fs from "fs";
import path from "path";
import { sign, JwtPayload } from "jsonwebtoken";
import createHttpError from "http-errors";
import { Config } from "../config";
import { RefreshToken } from "../entity/RefreshToken";
import { Repository } from "typeorm";
import { User } from "../entity/User";

export class TokenService {
    constructor(private refreshTokenRepository: Repository<RefreshToken>) {}
    generateAccessToken(payload: JwtPayload) {
        let privateKey: Buffer;
        try {
            privateKey = fs.readFileSync(
                path.join(__dirname, "../../certs/private.pem"),
            );
        } catch (error) {
            throw createHttpError(500, "SECRET_KEY is not found!");
        }

        const accessToken = sign(payload, privateKey, {
            algorithm: "RS256",
            expiresIn: "1h",
            issuer: "auth-service",
        });
        return accessToken;
    }

    generateRefreshToken(payload: JwtPayload) {
        const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
            algorithm: "HS256",
            expiresIn: "1y",
            issuer: "auth-service",
            jwtid: String(payload.jwtid),
        });
        return refreshToken;
    }

    async createRefreshToken(user: User) {
        const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;
        const expiresAt = new Date(Date.now() + MS_IN_YEAR);
        return await this.refreshTokenRepository.save({ user, expiresAt });
    }
}
