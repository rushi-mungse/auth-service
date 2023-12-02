import request from "supertest";
import app from "../../../src/app";
import { User } from "../../../src/entity";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../../src/config";
import { Role } from "../../../src/constants";
import { SendOtpRequest, VerifyOtpData } from "../../../src/types";
import { isJWT } from "../../utils";

describe("POST /api/auth/register/verify-otp", () => {
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
            password: "123456789",
            confirmPassword: "123456789",
        };

        it("should returns the 201 status code", async () => {
            const sendOtpResponse = await request(app)
                .post("/api/auth/register/send-otp")
                .send(userData);

            const verifyOtpResponse = await request(app)
                .post("/api/auth/register/verify-otp")
                .send(sendOtpResponse.body as VerifyOtpData);

            expect(verifyOtpResponse.statusCode).toBe(201);
        });

        it("should returns json response", async () => {
            const sendOtpResponse = await request(app)
                .post("/api/auth/register/send-otp")
                .send(userData);

            const verifyOtpResponse = await request(app)
                .post("/api/auth/register/verify-otp")
                .send(sendOtpResponse.body as VerifyOtpData);

            expect(
                (verifyOtpResponse.headers as Record<string, string>)[
                    "content-type"
                ],
            ).toEqual(expect.stringContaining("json"));
        });

        it("should persist the user in the database", async () => {
            const sendOtpResponse = await request(app)
                .post("/api/auth/register/send-otp")
                .send(userData);

            await request(app)
                .post("/api/auth/register/verify-otp")
                .send(sendOtpResponse.body as VerifyOtpData);

            const userRepositery = connection.getRepository(User);
            const users = await userRepositery.find();

            expect(users).toHaveLength(1);
            expect(users[0].fullName).toBe(userData.fullName);
            expect(users[0].email).toBe(userData.email);
        });

        it("should returns an user id if new user register", async () => {
            const userData = {
                fullName: "Rushikesh Mungse",
                email: "mungse.rushi@gmail.com",
                password: "123456789",
                confirmPassword: "123456789",
            };

            const sendOtpResponse = await request(app)
                .post("/api/auth/register/send-otp")
                .send(userData);

            const verifyOtpResponse = await request(app)
                .post("/api/auth/register/verify-otp")
                .send(sendOtpResponse.body as VerifyOtpData);

            expect(verifyOtpResponse.body).toHaveProperty("id");

            const repository = connection.getRepository(User);
            const users = await repository.find();

            expect((verifyOtpResponse.body as Record<string, string>).id).toBe(
                users[0].id,
            );
        });

        it("should returns 408 status code if otp is expired", async () => {
            const expires = Date.now() - 1000 * 60 * 10;
            const sendOtpResponse = {
                fullName: "Rushikesh Mungse",
                email: "mungse.rushi@gmail.com",
                hashOtp: `1552c4883dd6faa52d5bb20d0b3d47c0d6c6282d6ba9d22b67661c15e354895a#${expires}#$2b$10$gyhcxaGe03TERr8JpvDX/uXEUCuwRc9Mxo6iBBy8IL0ov8Gt8gmWW`,
                otp: "2222",
            };

            const verifyOtpResponse = await request(app)
                .post("/api/auth/register/verify-otp")
                .send(sendOtpResponse);

            expect(verifyOtpResponse.statusCode).toBe(408);
        });

        it("should returns 400 status code if hash otp is invalid", async () => {
            const sendOtpResponse = await request(app)
                .post("/api/auth/register/send-otp")
                .send(userData);

            const verifyOtpResponse = await request(app)
                .post("/api/auth/register/verify-otp")
                .send({
                    ...(sendOtpResponse.body as VerifyOtpData),
                    hashOtp: "invalid hash otp",
                });

            expect(verifyOtpResponse.statusCode).toBe(400);
        });

        it("should assign cutomer role to user", async () => {
            const sendOtpResponse = await request(app)
                .post("/api/auth/register/send-otp")
                .send(userData);

            await request(app)
                .post("/api/auth/register/verify-otp")
                .send(sendOtpResponse.body as SendOtpRequest);

            const repository = connection.getRepository(User);
            const users = await repository.find();
            expect(users[0].role).toBe(Role.CUSTOMER);
        });

        it("should store hashed password in the database", async () => {
            const sendOtpResponse = await request(app)
                .post("/api/auth/register/send-otp")
                .send(userData);

            await request(app)
                .post("/api/auth/register/verify-otp")
                .send(sendOtpResponse.body as SendOtpRequest);

            const repository = connection.getRepository(User);
            const users = await repository.find();

            const password = users[0].password;
            expect(password).toHaveLength(60);
            expect(password).toMatch(/^\$2[a|b]\$\d+\$/);
        });

        it("should return 409 status code if user is already exists", async () => {
            const sendOtpResponse = await request(app)
                .post("/api/auth/register/send-otp")
                .send(userData);

            const dummyUserData = {
                fullName: "Rushikesh Mungse",
                email: "mungse.rushi@gmail.com",
                password: "xesdfsdfsdfs",
                role: "customer",
            };

            const repository = connection.getRepository(User);
            await repository.save(dummyUserData);

            const response = await request(app)
                .post("/api/auth/register/verify-otp")
                .send(sendOtpResponse.body as VerifyOtpData);

            expect(response.statusCode).toBe(409);

            const users = await repository.find();
            expect(users).toHaveLength(1);
        });

        it("should be set accessToken and refreshToken in cookies", async () => {
            const sendOtpResponse = await request(app)
                .post("/api/auth/register/send-otp")
                .send(userData);

            const response = await request(app)
                .post("/api/auth/register/verify-otp")
                .send(sendOtpResponse.body as VerifyOtpData);
            interface Headers {
                ["set-cookie"]: string[];
            }

            let accessToken: string | null = null;
            let refreshToken: string | null = null;

            const cookies =
                (response.headers as unknown as Headers)["set-cookie"] || [];

            cookies.forEach((cookie) => {
                if (cookie.startsWith("accessToken"))
                    accessToken = cookie.split(";")[0].split("=")[1];
                if (cookie.startsWith("refreshToken"))
                    refreshToken = cookie.split(";")[0].split("=")[1];
            });

            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();

            expect(isJWT(accessToken)).toBeTruthy();
            expect(isJWT(refreshToken)).toBeTruthy();
        });
    });

    describe("Some fields are missing", () => {
        it("should return 400 status code if email is missing", async () => {
            const verifyOtpData = {
                fullName: "Rushikesh Mungse",
                email: "",
                hashOtp:
                    "1552c4883dd6faa52d5bb20d0b3d47c0d6c6282d6ba9d22b67661c15e354895a#1701019911562#$2b$10$gyhcxaGe03TERr8JpvDX/uXEUCuwRc9Mxo6iBBy8IL0ov8Gt8gmWW",
                otp: "2222",
            };

            const response = await request(app)
                .post("/api/auth/register/verify-otp")
                .send(verifyOtpData);

            expect(response.statusCode).toBe(400);
            const repository = connection.getRepository(User);
            const users = await repository.find();
            expect(users).toHaveLength(0);
        });

        it("should return 400 status code if fullName is missing", async () => {
            const verifyOtpData = {
                fullName: "",
                email: "mungse.rushi@gmail.com",
                hashOtp:
                    "1552c4883dd6faa52d5bb20d0b3d47c0d6c6282d6ba9d22b67661c15e354895a#1701019911562#$2b$10$gyhcxaGe03TERr8JpvDX/uXEUCuwRc9Mxo6iBBy8IL0ov8Gt8gmWW",
                otp: "2222",
            };

            const response = await request(app)
                .post("/api/auth/register/verify-otp")
                .send(verifyOtpData);

            expect(response.statusCode).toBe(400);
            const repository = connection.getRepository(User);
            const users = await repository.find();
            expect(users).toHaveLength(0);
        });

        it("should return 400 status code if hashOtp is missing", async () => {
            const verifyOtpData = {
                fullName: "Rushikesh Mungse",
                email: "mungse.rushi@gmail.com",
                hashOtp: "",
                otp: "2222",
            };

            const response = await request(app)
                .post("/api/auth/register/verify-otp")
                .send(verifyOtpData);

            expect(response.statusCode).toBe(400);
            const repository = connection.getRepository(User);
            const users = await repository.find();
            expect(users).toHaveLength(0);
        });

        it("should return 400 status code if otp is missing", async () => {
            const verifyOtpData = {
                fullName: "Rushikesh Mungse",
                email: "mungse.rushi@gmail.com",
                hashOtp:
                    "1552c4883dd6faa52d5bb20d0b3d47c0d6c6282d6ba9d22b67661c15e354895a#1701019911562#$2b$10$gyhcxaGe03TERr8JpvDX/uXEUCuwRc9Mxo6iBBy8IL0ov8Gt8gmWW",
                otp: "",
            };

            const response = await request(app)
                .post("/api/auth/register/verify-otp")
                .send(verifyOtpData);

            expect(response.statusCode).toBe(400);
            const repository = connection.getRepository(User);
            const users = await repository.find();
            expect(users).toHaveLength(0);
        });

        it("should return 400 status code if email is not valid email", async () => {
            const verifyOtpData = {
                fullName: "Rushikesh Mungse",
                email: "mungse.rushigmail.com",
                hashOtp:
                    "1552c4883dd6faa52d5bb20d0b3d47c0d6c6282d6ba9d22b67661c15e354895a#1701019911562#$2b$10$gyhcxaGe03TERr8JpvDX/uXEUCuwRc9Mxo6iBBy8IL0ov8Gt8gmWW",
                otp: "2222",
            };

            const response = await request(app)
                .post("/api/auth/register/verify-otp")
                .send(verifyOtpData);

            expect(response.statusCode).toBe(400);
            const repository = connection.getRepository(User);
            const users = await repository.find();
            expect(users).toHaveLength(0);
        });

        it("should return 400 status code if otp is invalid", async () => {
            const verifyOtpData = {
                fullName: "Rushikesh Mungse",
                email: "mungse.rushi@gmail.com",
                hashOtp:
                    "1552c4883dd6faa52d5bb20d0b3d47c0d6c6282d6ba9d22b67661c15e354895a#1701019911562#$2b$10$gyhcxaGe03TERr8JpvDX/uXEUCuwRc9Mxo6iBBy8IL0ov8Gt8gmWW",
                otp: "222",
            };

            const response = await request(app)
                .post("/api/auth/register/verify-otp")
                .send(verifyOtpData);

            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
    });

    describe("Sanitize user input before adding into the database", () => {
        it("should email is proper formate:trim", async () => {
            const userData = {
                fullName: "Rushikesh Mungse",
                email: "mungse.rushi@gmail.com",
                password: "123456789",
                confirmPassword: "123456789",
            };

            const verifyOtpResponse = await request(app)
                .post("/api/auth/register/send-otp")
                .send(userData);

            await request(app)
                .post("/api/auth/register/verify-otp")
                .send({
                    ...(verifyOtpResponse.body as SendOtpRequest),
                    email: " mungse.rushi@gmail.com ",
                });

            const repository = connection.getRepository(User);
            const users = await repository.find();
            expect(users[0].email).toBe("mungse.rushi@gmail.com");
        });

        it("should fullName is proper formate:trim", async () => {
            const userData = {
                fullName: "Rushikesh Mungse",
                email: "mungse.rushi@gmail.com",
                password: "123456789",
                confirmPassword: "123456789",
            };

            const verifyOtpResponse = await request(app)
                .post("/api/auth/register/send-otp")
                .send(userData);

            await request(app)
                .post("/api/auth/register/verify-otp")
                .send({
                    ...(verifyOtpResponse.body as SendOtpRequest),
                    fullName: " Rushikesh Mungse ",
                });

            const repository = connection.getRepository(User);
            const users = await repository.find();
            expect(users[0].fullName).toBe("Rushikesh Mungse");
        });
    });
});
