import { DataSource } from "typeorm";
import { logger } from "../../src/config";

export const truncateTables = async (connection: DataSource) => {
    try {
        const entities = connection.entityMetadatas;
        for (const entity of entities) {
            const repository = connection.getRepository(entity.name);
            await repository.clear();
        }
    } catch (error) {
        if (error instanceof Error) logger.error(error.message);
    }
};

export const isHashOtp = (hashOtp: string): boolean => {
    const parts = hashOtp.split("#");
    if (parts.length !== 3) return false;
    return true;
};

// to check jwt token is valid
export const isJWT = (token: string | null): boolean => {
    if (token === null) return false;
    const parts = token.split(".");

    if (parts.length !== 3) return false;

    try {
        parts.forEach((part) => {
            Buffer.from(part, "base64").toString("utf-8");
        });
        return true;
    } catch (error) {
        logger.error(error);
        return false;
    }
};
