import { DataSource } from "typeorm";
import logger from "../../src/config/logger";

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
