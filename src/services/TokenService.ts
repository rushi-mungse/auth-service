import { sign, JwtPayload, verify } from "jsonwebtoken";
import createHttpError from "http-errors";
import { Config } from "../config";
import { Repository } from "typeorm";
import { User, RefreshToken } from "../entity";

export default class TokenService {
    constructor(private refreshTokenRepository: Repository<RefreshToken>) {}
    generateAccessToken(payload: JwtPayload) {
        let privateKey: string;
        if (!Config.PRIVATE_KEY) {
            throw createHttpError(500, "SECRET_KEY is not found!");
        }

        try {
            privateKey = Config.PRIVATE_KEY;
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
        if (!Config.REFRESH_TOKEN_SECRET)
            throw createHttpError(500, "SECRET_HASH is not found!");
        const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET, {
            algorithm: "HS256",
            expiresIn: "1y",
            issuer: "auth-service",
            jwtid: String(payload.id),
        });
        return refreshToken;
    }

    async createRefreshToken(user: User) {
        const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;
        const expiresAt = new Date(Date.now() + MS_IN_YEAR);
        return await this.refreshTokenRepository.save({ user, expiresAt });
    }

    async deleteRefreshTokenById(tokenId: number) {
        await this.refreshTokenRepository.delete(tokenId);
    }

    verifyRefreshToken(refreshTOken: string) {
        if (!Config.REFRESH_TOKEN_SECRET)
            throw createHttpError(500, "SECRET_HASH is not found!");
        return verify(refreshTOken, Config.REFRESH_TOKEN_SECRET);
    }
}
