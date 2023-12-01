import request from "supertest";
import app from "../../../app";
import { User } from "../../../entity";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../../config";
import { Role } from "../../../constants";
import { isHashOtp } from "../../utils";

describe.skip("POST /api/auth/register/send-otp", () => {
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
            password: "rushikesh@pass",
            confirmPassword: "rushikesh@pass",
        };

        it("should returns the 200 status code", async () => {
            const response = await request(app)
                .post("/api/auth/register/send-otp")
                .send(userData);

            expect(response.statusCode).toBe(200);
        });

        it("should returns json response", async () => {
            const response = await request(app)
                .post("/api/auth/register/send-otp")
                .send(userData);

            expect(
                (response.headers as Record<string, string>)["content-type"],
            ).toEqual(expect.stringContaining("json"));
        });

        it("should return 409 status code if user is already exists", async () => {
            const repository = connection.getRepository(User);
            await repository.save({ ...userData, role: Role.CUSTOMER });

            const response = await request(app)
                .post("/api/auth/register/send-otp")
                .send(userData);

            expect(response.statusCode).toBe(409);
            const users = await repository.find();
            expect(users).toHaveLength(1);
        });

        it("should return hashed otp if send-otp endpoint call", async () => {
            const response = await request(app)
                .post("/api/auth/register/send-otp")
                .send(userData);

            expect(response.body).toHaveProperty("hashOtp");
            expect(response.body).toHaveProperty("email");
            expect(response.body).toHaveProperty("fullName");
        });

        it("should confirm responsed hash otp is valid", async () => {
            const response = await request(app)
                .post("/api/auth/register/send-otp")
                .send(userData);

            expect(
                isHashOtp((response.body as Record<string, string>)["hashOtp"]),
            ).toBeTruthy();
        });
    });

    describe("Some fields are missing", () => {
        it("should return 400 status code if email is missing", async () => {
            const userData = {
                fullName: "Rushikesh Mungse",
                email: "",
                password: "rushikesh@pass",
                confirmPassword: "rushikesh@pass",
            };

            const response = await request(app)
                .post("/api/auth/register/send-otp")
                .send(userData);

            expect(response.statusCode).toBe(400);
            const repository = connection.getRepository(User);
            const users = await repository.find();
            expect(users).toHaveLength(0);
        });

        it("should return 400 status code if fullName is missing", async () => {
            const userData = {
                fullName: "",
                email: "mungse.rushi@gmail.com",
                password: "rushikesh@pass",
                confirmPassword: "rushikesh@pass",
            };

            const response = await request(app)
                .post("/api/auth/register/send-otp")
                .send(userData);

            expect(response.statusCode).toBe(400);
            const repository = connection.getRepository(User);
            const users = await repository.find();
            expect(users).toHaveLength(0);
        });

        it("should return 400 status code if password is missing", async () => {
            const userData = {
                fullName: "Rushikesh Mungse",
                email: "mungse.rushi@gmail.com",
                password: "",
                confirmPassword: "rushikesh@pass",
            };

            const response = await request(app)
                .post("/api/auth/register/send-otp")
                .send(userData);

            expect(response.statusCode).toBe(400);
            const repository = connection.getRepository(User);
            const users = await repository.find();
            expect(users).toHaveLength(0);
        });

        it("should return 400 status code if confirm password is missing", async () => {
            const userData = {
                fullName: "Rushikesh Mungse",
                email: "mungse.rushi@gmail.com",
                password: "rushikesh@pass",
                confirmPassword: "",
            };

            const response = await request(app)
                .post("/api/auth/register/send-otp")
                .send(userData);

            expect(response.statusCode).toBe(400);
            const repository = connection.getRepository(User);
            const users = await repository.find();
            expect(users).toHaveLength(0);
        });

        it("should return 400 status code if email is not valid email", async () => {
            const userData = {
                fullName: "Rushikesh Mungse",
                email: "mungse.rushigmail.com",
                password: "rushikesh@pass",
                confirmPassword: "rushikesh@pass",
            };

            const response = await request(app)
                .post("/api/auth/register/send-otp")
                .send(userData);

            expect(response.statusCode).toBe(400);
            const repository = connection.getRepository(User);
            const users = await repository.find();
            expect(users).toHaveLength(0);
        });

        it("should return 400 status code if password length is less than 8 chars", async () => {
            const userData = {
                fullName: "Rushikesh Mungse",
                email: "rakesh@mern.space",
                password: "pass",
                confirmPassword: "pass",
            };
            const response = await request(app)
                .post("/api/auth/register/send-otp")
                .send(userData);

            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });

        it("should return 400 status code if confirm password not match to password", async () => {
            const userData = {
                fullName: "Rushikesh Mungse",
                email: "mungse.rushi@gmail.com",
                password: "123456789",
                confirmPassword: "1234567",
            };

            const response = await request(app)
                .post("/api/auth/register/send-otp")
                .send(userData);

            expect(response.statusCode).toBe(400);
        });
    });

    describe("Sanitize user input before sending to the user", () => {
        it("should email is proper formate:trim", async () => {
            const userData = {
                fullName: "Rushikesh Mungse",
                email: " mungse.rushi@gmail.com ",
                password: "rushikesh@pass",
                confirmPassword: "rushikesh@pass",
            };

            const response = await request(app)
                .post("/api/auth/register/send-otp")
                .send(userData);

            expect((response.body as Record<string, string>)["email"]).toBe(
                "mungse.rushi@gmail.com",
            );
        });

        it("should fullName is proper formate:trim", async () => {
            const userData = {
                fullName: " Rushikesh Mungse ",
                email: "mungse.rushi@gmail.com",
                password: "rushikesh@pass",
                confirmPassword: "rushikesh@pass",
            };

            const response = await request(app)
                .post("/api/auth/register/send-otp")
                .send(userData);

            expect((response.body as Record<string, string>)["fullName"]).toBe(
                "Rushikesh Mungse",
            );
        });
    });
});
