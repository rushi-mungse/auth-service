import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config";
import { SetPasswordData, VerifyOtpData } from "../../src/types";

describe("POST /api/auth/set-password", () => {
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

    const sendOtpData = {
        fullName: "Rushikesh Mungse",
        email: "mungse.rushi@gmail.com",
        password: "rushi@495",
        confirmPassword: "rushi@495",
    };

    const forgetPasswordData = {
        email: "mungse.rushi@gmail.com",
    };

    describe("Given all fields", () => {
        it("should returns the 200 status code", async () => {
            const sendOtpResponse = await request(app)
                .post("/api/auth/register/send-otp")
                .send(sendOtpData);

            await request(app)
                .post("/api/auth/register/verify-otp")
                .send(sendOtpResponse.body as VerifyOtpData);

            const forgetPasswordResponse = await request(app)
                .post("/api/auth/forget-password")
                .send(forgetPasswordData);

            const setPasswordResponse = await request(app)
                .post("/api/auth/set-password")
                .send({
                    ...forgetPasswordResponse.body,
                    password: "12345678",
                    confirmPassword: "12345678",
                } as SetPasswordData);

            expect(setPasswordResponse.statusCode).toBe(200);
        });

        it("should returns json response", async () => {
            const sendOtpResponse = await request(app)
                .post("/api/auth/register/send-otp")
                .send(sendOtpData);

            await request(app)
                .post("/api/auth/register/verify-otp")
                .send(sendOtpResponse.body as VerifyOtpData);

            const forgetPasswordResponse = await request(app)
                .post("/api/auth/forget-password")
                .send(forgetPasswordData);

            const setPasswordResponse = await request(app)
                .post("/api/auth/set-password")
                .send({
                    ...forgetPasswordResponse.body,
                    password: "12345678",
                    confirmPassword: "12345678",
                } as SetPasswordData);

            expect(setPasswordResponse.statusCode).toBe(200);

            expect(
                (setPasswordResponse.headers as Record<string, string>)[
                    "content-type"
                ],
            ).toEqual(expect.stringContaining("json"));
        });

        it("should return 401 status code if email is not registered", async () => {
            const sendOtpResponse = await request(app)
                .post("/api/auth/register/send-otp")
                .send(sendOtpData);

            await request(app)
                .post("/api/auth/register/verify-otp")
                .send(sendOtpResponse.body as VerifyOtpData);

            const forgetPasswordResponse = await request(app)
                .post("/api/auth/forget-password")
                .send(forgetPasswordData);

            const setPasswordResponse = await request(app)
                .post("/api/auth/set-password")
                .send({
                    ...forgetPasswordResponse.body,
                    email: "xxx@gmail.com",
                    password: "12345678",
                    confirmPassword: "12345678",
                } as SetPasswordData);

            expect(setPasswordResponse.statusCode).toBe(401);
        });

        it("should return user", async () => {
            const sendOtpResponse = await request(app)
                .post("/api/auth/register/send-otp")
                .send(sendOtpData);

            await request(app)
                .post("/api/auth/register/verify-otp")
                .send(sendOtpResponse.body as VerifyOtpData);

            const forgetPasswordResponse = await request(app)
                .post("/api/auth/forget-password")
                .send(forgetPasswordData);

            const setPasswordResponse = await request(app)
                .post("/api/auth/set-password")
                .send({
                    ...forgetPasswordResponse.body,
                    password: "12345678",
                    confirmPassword: "12345678",
                } as SetPasswordData);

            console.log(setPasswordResponse.body);

            expect(setPasswordResponse.body).toHaveProperty("email");
            expect(setPasswordResponse.body).toHaveProperty("fullName");
            expect(setPasswordResponse.body).toHaveProperty("id");
        });
    });

    describe("Some fields are missing", () => {
        it("should return 400 status code if email is missing", async () => {
            const sendOtpResponse = await request(app)
                .post("/api/auth/register/send-otp")
                .send(sendOtpData);

            await request(app)
                .post("/api/auth/register/verify-otp")
                .send(sendOtpResponse.body as VerifyOtpData);

            const forgetPasswordResponse = await request(app)
                .post("/api/auth/forget-password")
                .send(forgetPasswordData);

            const setPasswordResponse = await request(app)
                .post("/api/auth/set-password")
                .send({
                    ...forgetPasswordResponse.body,
                    email: "",
                    password: "12345678",
                    confirmPassword: "12345678",
                } as SetPasswordData);

            expect(setPasswordResponse.statusCode).toBe(400);
        });

        it("should return 400 status code if otp is missing", async () => {
            const sendOtpResponse = await request(app)
                .post("/api/auth/register/send-otp")
                .send(sendOtpData);

            await request(app)
                .post("/api/auth/register/verify-otp")
                .send(sendOtpResponse.body as VerifyOtpData);

            const forgetPasswordResponse = await request(app)
                .post("/api/auth/forget-password")
                .send(forgetPasswordData);

            const setPasswordResponse = await request(app)
                .post("/api/auth/set-password")
                .send({
                    ...forgetPasswordResponse.body,
                    otp: "",
                    password: "12345678",
                    confirmPassword: "12345678",
                } as SetPasswordData);

            expect(setPasswordResponse.statusCode).toBe(400);
        });
    });
});
