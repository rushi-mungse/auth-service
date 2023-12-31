import "reflect-metadata";
import { DataSource } from "typeorm";
import { User, RefreshToken, Tenant } from "../entity";
import { Config } from ".";

export default new DataSource({
    type: "postgres",
    host: Config.DB_HOST,
    port: Number(Config.DB_PORT),
    username: Config.DB_USERNAME,
    password: Config.DB_PASSWORD,
    database: Config.DB_NAME,
    synchronize: false,
    logging: false,
    entities: [User, RefreshToken, Tenant],
    migrations: ["src/migration/*.ts"],
    subscribers: [],
});
