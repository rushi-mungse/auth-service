import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config";
import createJwtMock from "mock-jwks";
import { Role } from "../../src/constants";
import { VerifyOtpData } from "../../src/types";

describe("GET /api/user", () => {
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
            const adminToken = jwt.token({
                sub: "1",
                role: Role.ADMIN,
            });

            const getUserResponse = await request(app)
                .get(`/api/user`)
                .set("Cookie", [`accessToken=${adminToken}`]);

            expect(getUserResponse.statusCode).toBe(200);
        });

        it("should returns the json status code", async () => {
            const adminToken = jwt.token({
                sub: "1",
                role: Role.ADMIN,
            });

            const getUserResponse = await request(app)
                .get(`/api/user`)
                .set("Cookie", [`accessToken=${adminToken}`]);

            expect(
                (getUserResponse.headers as Record<string, string>)[
                    "content-type"
                ],
            ).toEqual(expect.stringContaining("json"));
        });

        it("should returns the user array", async () => {
            const user = {
                fullName: "Rushikesh Mungse",
                email: "mungse.rushi@gmail.com",
                password: "123456789",
                confirmPassword: "123456789",
            };

            const sendOtpResponse = await request(app)
                .post("/api/auth/register/send-otp")
                .send(user);

            await request(app)
                .post("/api/auth/register/verify-otp")
                .send(sendOtpResponse.body as VerifyOtpData);

            const adminToken = jwt.token({
                sub: "1",
                role: Role.ADMIN,
            });

            const getUserResponse = await request(app)
                .get(`/api/user`)
                .set("Cookie", [`accessToken=${adminToken}`]);

            expect(Array.isArray(getUserResponse.body.users)).toBe(true);
        });

        it("should returns the 403 status code if user is not admin", async () => {
            const adminToken = jwt.token({
                sub: "1",
                role: Role.MANAGER,
            });

            const getUserResponse = await request(app)
                .get(`/api/user`)
                .set("Cookie", [`accessToken=${adminToken}`]);

            expect(getUserResponse.statusCode).toBe(403);
        });
    });
});
