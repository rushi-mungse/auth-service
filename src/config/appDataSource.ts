import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entity/User";
import { RefreshToken } from "../entity/RefreshToken";
import { Config } from ".";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: Config.DB_HOST,
    port: Number(Config.DB_PORT),
    username: Config.DB_USERNAME,
    password: Config.DB_PASSWORD,
    database: Config.DB_NAME,
    synchronize: Config.NODE_ENV === "test" || Config.NODE_ENV === "dev",
    logging: false,
    entities: [User, RefreshToken],
    migrations: [],
    subscribers: [],
});
