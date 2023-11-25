import request from "supertest";
import app from "../../src/app";
import { User } from "../../src/entity/User";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/appDataSource";
import { Role } from "../../src/constants";

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
            const response = await request(app)
                .post("/api/auth/register")
                .send(userData);

            expect(response.statusCode).toBe(201);
        });

        it("should returns json response", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send(userData);

            expect(
                (response.headers as Record<string, string>)["content-type"],
            ).toEqual(expect.stringContaining("json"));
        });

        it("should persist the user in the database", async () => {
            await request(app).post("/api/auth/register").send(userData);

            const userRepositery = connection.getRepository(User);
            const users = await userRepositery.find();
            expect(users).toHaveLength(1);
            expect(users[0].fullName).toBe(userData.fullName);
            expect(users[0].email).toBe(userData.email);
        });

        it("should returns an user id if new user register", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send(userData);

            expect(response.body).toHaveProperty("id");
            const repository = connection.getRepository(User);
            const users = await repository.find();
            expect((response.body as Record<string, string>).id).toBe(
                users[0].id,
            );
        });

        it("should assign cutomer role to user", async () => {
            await request(app).post("/api/auth/register").send(userData);

            const repository = connection.getRepository(User);
            const users = await repository.find();
            expect(users[0].role).toBe(Role.CUSTOMER);
        });

        it("should store hashed password in the database", async () => {
            await request(app).post("/api/auth/register").send(userData);

            const repository = connection.getRepository(User);
            const users = await repository.find();
            expect(users[0].password).not.toBe(userData.password);
            expect(users[0].password).toHaveLength(60);
            expect(users[0].password).toMatch(/^\$2[a|b]\$\d+\$/);
        });

        it("should return 400 status code if user is already exists", async () => {
            const repository = connection.getRepository(User);
            await repository.save({ ...userData, role: Role.CUSTOMER });

            const response = await request(app)
                .post("/api/auth/register")
                .send(userData);

            expect(response.statusCode).toBe(400);
            const users = await repository.find();
            expect(users).toHaveLength(1);
        });
    });

    describe("Some fields are missing", () => {});
});
