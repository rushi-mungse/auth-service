import { Request } from "express";
import { expressjwt } from "express-jwt";
import { AuthCookie, RefreshTokenPayload } from "../types";
import { AppDataSource, Config, logger } from "../config";
import { RefreshToken } from "../entity";

/* validate refresh token and check if revoked refresh token */
export default expressjwt({
    secret: Config.REFRESH_TOKEN_SECRET!,
    algorithms: ["HS256"],
    getToken(req: Request) {
        const { refreshToken } = req.cookies as AuthCookie;
        return refreshToken;
    },
    async isRevoked(req: Request, token) {
        const payload = token?.payload as RefreshTokenPayload;

        try {
            /* check refresh token is in db */
            const refreshTokenRepository =
                AppDataSource.getRepository(RefreshToken);
            const refreshToken = await refreshTokenRepository.findOne({
                where: {
                    id: Number(payload.id),
                    user: { id: Number(payload.sub) },
                },
            });
            return refreshToken === null;
        } catch (error) {
            logger.error("Error while getting the refresh token", {
                id: payload.id,
            });
        }
        return true;
    },
});
