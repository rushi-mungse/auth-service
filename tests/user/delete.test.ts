import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config";
import createJwtMock from "mock-jwks";
import { Role } from "../../src/constants";
import { VerifyOtpData } from "../../src/types";
import { User } from "../../src/entity";

describe("DELETE /api/user/:id", () => {
    let connection: DataSource;
    let jwt: ReturnType<typeof createJwtMock>;

    beforeAll(async () => {
        jwt = createJwtMock("http://localhost:5000");
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        jwt.start();
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterEach(() => {
        jwt.stop();
    });

    describe("Given all fields", () => {
        it("should returns the 200 status code", async () => {
            const user = {
                fullName: "Rushikesh Mungse",
                email: "mungse.rushi@gmail.com",
                password: "123456789",
                confirmPassword: "123456789",
            };

            const sendOtpResponse = await request(app)
                .post("/api/auth/register/send-otp")
                .send(user);

            const verifyOtpResponse = await request(app)
                .post("/api/auth/register/verify-otp")
                .send(sendOtpResponse.body as VerifyOtpData);

            let userId = verifyOtpResponse.body.user.id;

            const adminToken = jwt.token({
                sub: "1",
                role: Role.ADMIN,
            });

            const deleteUserResponse = await request(app)
                .delete(`/api/user/${userId}`)
                .set("Cookie", [`accessToken=${adminToken}`]);

            expect(deleteUserResponse.statusCode).toBe(200);
        });

        it("should returns the json data", async () => {
            const user = {
                fullName: "Rushikesh Mungse",
                email: "mungse.rushi@gmail.com",
                password: "123456789",
                confirmPassword: "123456789",
            };

            const sendOtpResponse = await request(app)
                .post("/api/auth/register/send-otp")
                .send(user);

            const verifyOtpResponse = await request(app)
                .post("/api/auth/register/verify-otp")
                .send(sendOtpResponse.body as VerifyOtpData);

            let userId = verifyOtpResponse.body.user.id;

            const adminToken = jwt.token({
                sub: "1",
                role: Role.ADMIN,
            });

            const deleteUserResponse = await request(app)
                .delete(`/api/user/${userId}`)
                .set("Cookie", [`accessToken=${adminToken}`]);

            expect(
                (deleteUserResponse.headers as Record<string, string>)[
                    "content-type"
                ],
            ).toEqual(expect.stringContaining("json"));
        });

        it("should returns the deleted user id", async () => {
            const user = {
                fullName: "Rushikesh Mungse",
                email: "mungse.rushi@gmail.com",
                password: "123456789",
                confirmPassword: "123456789",
            };

            const sendOtpResponse = await request(app)
                .post("/api/auth/register/send-otp")
                .send(user);

            const verifyOtpResponse = await request(app)
                .post("/api/auth/register/verify-otp")
                .send(sendOtpResponse.body as VerifyOtpData);

            let userId = verifyOtpResponse.body.user.id;

            const adminToken = jwt.token({
                sub: "1",
                role: Role.ADMIN,
            });

            await request(app)
                .delete(`/api/user/${userId}`)
                .set("Cookie", [`accessToken=${adminToken}`]);

            const usersRepository = connection.getRepository(User);
            const users = await usersRepository.find();

            expect(users).toHaveLength(0);
        });

        it("should check persist user in database", async () => {
            const user = {
                fullName: "Rushikesh Mungse",
                email: "mungse.rushi@gmail.com",
                password: "123456789",
                confirmPassword: "123456789",
            };

            const sendOtpResponse = await request(app)
                .post("/api/auth/register/send-otp")
                .send(user);

            const verifyOtpResponse = await request(app)
                .post("/api/auth/register/verify-otp")
                .send(sendOtpResponse.body as VerifyOtpData);

            let userId = verifyOtpResponse.body.user.id;

            const adminToken = jwt.token({
                sub: "1",
                role: Role.ADMIN,
            });

            const deleteUserResponse = await request(app)
                .delete(`/api/user/${userId}`)
                .set("Cookie", [`accessToken=${adminToken}`]);

            expect(deleteUserResponse.body).toHaveProperty("id");
            expect(Number(deleteUserResponse.body.id)).toBe(userId);
        });
    });

    describe("Missing some fields", () => {
        it("should returns the 400 status code if id is incorrect", async () => {
            const adminToken = jwt.token({
                sub: "1",
                role: Role.ADMIN,
            });

            const deleteUserResponse = await request(app)
                .delete(`/api/user/werwer`)
                .set("Cookie", [`accessToken=${adminToken}`]);

            expect(deleteUserResponse.statusCode).toBe(400);
        });

        it("should returns 404 status code if user not found", async () => {
            const adminToken = jwt.token({
                sub: "1",
                role: Role.ADMIN,
            });

            const deleteUserResponse = await request(app)
                .delete(`/api/user/2`)
                .set("Cookie", [`accessToken=${adminToken}`]);

            expect(deleteUserResponse.statusCode).toBe(400);
        });
    });
});
