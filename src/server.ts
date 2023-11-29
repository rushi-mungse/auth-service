import app from "./app";
import { Config } from "./config";
import { AppDataSource } from "./config";
import logger from "./config/logger";

const startServer = async () => {
    const PORT = Config.PORT;
    try {
        await AppDataSource.initialize();
        app.listen(PORT, () =>
            logger.info(`Server linstening on port ${PORT}`),
        );
    } catch (error) {
        if (error instanceof Error) {
            logger.error(error.message);
        }
        setTimeout(() => {
            process.exit(1);
        }, 1000);
    }
};

void startServer();
