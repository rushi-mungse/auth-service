import app from "./app";
import { Config, AppDataSource, logger } from "./config";

const startServer = async () => {
    const PORT = Config.PORT;
    try {
        await AppDataSource.initialize();
        logger.info(`Database connected successfully`);
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
