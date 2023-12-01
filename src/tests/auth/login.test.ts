import request from "supertest";
import app from "../../app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../config";
import { User } from "../../entity";
import { VerifyOtpData } from "../../types";

describe("POST /api/auth/login", () => {
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
            password: "rushi@123",
            confirmPassword: "rushi@123",
        };

        const loginData = {
            email: "mungse.rushi@gmail.com",
            password: "rushi@123",
        };

        it("should returns the 200 status code", async () => {
            // Send Otp Request
            const sendOtpResponse = await request(app)
                .post("/api/auth/register/send-otp")
                .send(userData);

            // Verify Otp Request
            await request(app)
                .post("/api/auth/register/verify-otp")
                .send(sendOtpResponse.body as VerifyOtpData);

            const loginResponse = await request(app)
                .post("/api/auth/login")
                .send(loginData);

            expect(loginResponse.statusCode).toBe(200);
        });

        it("should returns json response", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send(loginData);

            expect(
                (response.headers as Record<string, string>)["content-type"],
            ).toEqual(expect.stringContaining("json"));
        });

        it("should return 400 status code if user is not found", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send(loginData);
            expect(response.statusCode).toBe(400);
        });

        it("should return user", async () => {
            // Send Otp Request
            const sendOtpResponse = await request(app)
                .post("/api/auth/register/send-otp")
                .send(userData);

            // Verify Otp Request
            await request(app)
                .post("/api/auth/register/verify-otp")
                .send(sendOtpResponse.body as VerifyOtpData);

            const response = await request(app)
                .post("/api/auth/login")
                .send(loginData);

            expect(response.body).toHaveProperty("email");
            expect(response.body).toHaveProperty("id");
            expect(response.body).toHaveProperty("fullName");
        });

        it("should return 400 status code if password does not match", async () => {
            // Send Otp Request
            const sendOtpResponse = await request(app)
                .post("/api/auth/register/send-otp")
                .send(userData);

            // Verify Otp Request
            await request(app)
                .post("/api/auth/register/verify-otp")
                .send(sendOtpResponse.body as VerifyOtpData);

            const response = await request(app)
                .post("/api/auth/login")
                .send({ ...loginData, password: "rushi@xxxx" });

            expect(response.statusCode).toBe(400);
        });
    });

    describe("Some fields are missing", () => {
        it("should return 400 status code if email is missing", async () => {
            const loginData = {
                email: "",
                password: "rushikesh@pass",
            };

            const response = await request(app)
                .post("/api/auth/login")
                .send(loginData);

            expect(response.statusCode).toBe(400);
        });

        it("should return 400 status code if password is missing", async () => {
            const userData = {
                email: "mungse.rushi@gmail.com",
                password: "",
            };

            const response = await request(app)
                .post("/api/auth/login")
                .send(userData);

            expect(response.statusCode).toBe(400);
        });

        it("should return 400 status code if email is not valid email", async () => {
            const loginData = {
                email: "mungse.rushigmail.com",
                password: "rushikesh@pass",
            };

            const response = await request(app)
                .post("/api/auth/login")
                .send(loginData);

            expect(response.statusCode).toBe(400);
        });
    });
});
