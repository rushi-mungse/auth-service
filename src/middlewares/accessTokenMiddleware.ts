import { Request } from "express";
import { GetVerificationKey, expressjwt } from "express-jwt";
import jwksClient from "jwks-rsa";
import { AuthCookie } from "../types";
import { Config } from "../config";

export default expressjwt({
    secret: jwksClient.expressJwtSecret({
        jwksUri: Config.JWKS_URI || "",
        cache: true,
        rateLimit: true,
    }) as GetVerificationKey,
    algorithms: ["RS256"],
    getToken(req: Request) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.split(" ")[1] !== "undefined") {
            const accessToken = authHeader.split(" ")[1];
            if (accessToken) {
                return accessToken;
            }
        }
        const { accessToken } = req.cookies as AuthCookie;
        return accessToken;
    },
});
