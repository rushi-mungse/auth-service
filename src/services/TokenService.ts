import fs from "fs";
import path from "path";
import { sign, JwtPayload } from "jsonwebtoken";
import createHttpError from "http-errors";
import { Config } from "../config";

export class TokenService {
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
}
