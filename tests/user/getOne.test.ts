import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config";
import createJwtMock from "mock-jwks";
import { Role } from "../../src/constants";
import { Tenant, User, VerifyOtpData } from "../../src/types";

describe("GET /api/user/id", () => {
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

            const getUserResponse = await request(app)
                .get(`/api/user/${userId}`)
                .set("Cookie", [`accessToken=${adminToken}`]);

            expect(getUserResponse.statusCode).toBe(200);
        });

        it("should returns the json status code", async () => {
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

            const getUserResponse = await request(app)
                .get(`/api/user/${userId}`)
                .set("Cookie", [`accessToken=${adminToken}`]);

            expect(
                (getUserResponse.headers as Record<string, string>)[
                    "content-type"
                ],
            ).toEqual(expect.stringContaining("json"));
        });

        it("should returns the user data", async () => {
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

            const getUserResponse = await request(app)
                .get(`/api/user/${userId}`)
                .set("Cookie", [`accessToken=${adminToken}`]);

            expect(getUserResponse.body.user as User).toHaveProperty("id");
            expect(getUserResponse.body.user as User).toHaveProperty(
                "fullName",
            );
            expect(getUserResponse.body.user as User).toHaveProperty("email");
            expect(getUserResponse.body.user as User).toHaveProperty("role");
            expect(getUserResponse.body.user as Tenant).toHaveProperty(
                "tenant",
            );
        });

        it("should returns the null user data if id is not found!", async () => {
            const adminToken = jwt.token({
                sub: "1",
                role: Role.ADMIN,
            });

            const getUserResponse = await request(app)
                .get(`/api/user/10`)
                .set("Cookie", [`accessToken=${adminToken}`]);

            expect(getUserResponse.body.user).toBeNull();
        });

        it("should returns the 403 status code if user is not admin", async () => {
            const adminToken = jwt.token({
                sub: "1",
                role: Role.MANAGER,
            });

            const getUserResponse = await request(app)
                .get(`/api/user/2`)
                .set("Cookie", [`accessToken=${adminToken}`]);

            expect(getUserResponse.statusCode).toBe(403);
        });

        it("should returns the 400 status code if id is not in params!", async () => {
            const adminToken = jwt.token({
                sub: "1",
                role: Role.ADMIN,
            });

            const getUserResponse = await request(app)
                .get(`/api/user/eriuw`)
                .set("Cookie", [`accessToken=${adminToken}`]);

            expect(getUserResponse.statusCode).toBe(400);
        });
    });
});
