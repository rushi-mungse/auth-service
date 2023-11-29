import app from "./app";
import { Config, AppDataSource, Logger } from "./config";

const startServer = async () => {
    const PORT = Config.PORT;
    try {
        await AppDataSource.initialize();
        app.listen(PORT, () =>
            Logger.info(`Server linstening on port ${PORT}`),
        );
    } catch (error) {
        if (error instanceof Error) {
            Logger.error(error.message);
        }
        setTimeout(() => {
            process.exit(1);
        }, 1000);
    }
};

void startServer();
