import request from "supertest";
import app from "../../src/app";
import { User } from "../../src/entity/User";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/appDataSource";
import logger from "../../src/config/logger";

describe("POST /api/auth/register", () => {
    let connection: DataSource;
    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();
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
                if (error instanceof Error) logger.error(error.message);
            }
        });

        it("should returns an user id when new user register", async () => {
            try {
                const response = await request(app)
                    .post("/api/auth/register")
                    .send(userData);
                expect(response.body).toHaveProperty("id");
                const repository = connection.getRepository(User);
                const users = await repository.find();
                expect((response.body as Record<string, string>).id).toBe(
                    users[0].id,
                );
            } catch (error) {
                if (error instanceof Error) logger.error(error.message);
            }
        });
    });

    describe("Some fields are missing", () => {});
});
