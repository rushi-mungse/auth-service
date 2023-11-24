import request from "supertest";
import app from "../../src/app";
import { User } from "../../src/entity/User";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/dataSource";
import { truncateTables } from "../utils";
import logger from "../../src/config/logger";

describe("POST /api/auth/register", () => {
    let connection: DataSource;
    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        await truncateTables(connection);
    });

    afterAll(async () => {
        await connection?.destroy();
    });

    describe("Given all fields", () => {
        const userData = {
            fullName: "Rushikesh Mungse",
            email: "mungse.rushi@gmail.com",
            password: "secret",
            confirmPassword: "secret",
        };

        it("should returns the 201 status code", async () => {
            try {
                const response = await request(app)
                    .post("/api/auth/register")
                    .send(userData);

                expect(response.statusCode).toBe(201);
            } catch (error) {
                // eslint-disable-next-line no-console
                console.log(error);
                if (error instanceof Error) logger.error(error.message);
            }
        });

        it("should returns json response", async () => {
            try {
                const response = await request(app)
                    .post("/api/auth/register")
                    .send(userData);

                expect(
                    (response.headers as Record<string, string>)[
                        "content-type"
                    ],
                ).toEqual(expect.stringContaining("json"));
            } catch (error) {
                // eslint-disable-next-line no-console
                console.log(error);
                if (error instanceof Error) logger.error(error.message);
            }
        });

        it("should persist the user in the database", async () => {
            try {
                await request(app).post("/api/auth/register").send(userData);
                const userRepositery = connection.getRepository(User);
                const users = await userRepositery.find();
                expect(users).toHaveLength(1);
                expect(users[0].fullName).toBe(userData.fullName);
                expect(users[0].email).toBe(userData.email);
            } catch (error) {
                // eslint-disable-next-line no-console
                console.log(error);
                if (error instanceof Error) logger.error(error.message);
            }
        });
    });

    describe("Some fields are missing", () => {});
});
