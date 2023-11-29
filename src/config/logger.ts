import winston from "winston";
import { Config } from "./index";

export default winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
    ),
    defaultMeta: { serviceName: "auth-service" },
    transports: [
        new winston.transports.File({
            level: "info",
            dirname: "logs",
            filename: "combined.log",
            silent: Config.NODE_ENV === "test",
        }),

        new winston.transports.File({
            level: "error",
            dirname: "logs",
            filename: "error.log",
            silent: Config.NODE_ENV === "test",
        }),

        new winston.transports.Console({
            level: "info",
            silent: Config.NODE_ENV === "test",
        }),
    ],
});
