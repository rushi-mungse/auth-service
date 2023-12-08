import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config";
import createJwtMock from "mock-jwks";
import { Role } from "../../src/constants";
import { VerifyOtpData } from "../../src/types";
import { User } from "../../src/entity";

describe("POST /api/user/create", () => {
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

            const tenantData = {
                name: "Fudo Restaurant",
                address: "Near Sivaji Nagar, Barshi",
            };

            const adminToken = jwt.token({
                sub: "1",
                role: Role.ADMIN,
            });

            const tenantResponse = await request(app)
                .post("/api/tenant/create")
                .send(tenantData)
                .set("Cookie", [`accessToken=${adminToken}`]);

            let tenantId = tenantResponse.body.tenant.id;

            const userData = {
                fullName: "Rushikesh Mungse",
                role: Role.MANAGER,
                tenantId,
            };

            const updateUserResponse = await request(app)
                .put(`/api/user/${userId}`)
                .send(userData)
                .set("Cookie", [`accessToken=${adminToken}`]);

            expect(updateUserResponse.statusCode).toBe(200);
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

            const tenantData = {
                name: "Fudo Restaurant",
                address: "Near Sivaji Nagar, Barshi",
            };

            const adminToken = jwt.token({
                sub: "1",
                role: Role.ADMIN,
            });

            const tenantResponse = await request(app)
                .post("/api/tenant/create")
                .send(tenantData)
                .set("Cookie", [`accessToken=${adminToken}`]);

            let tenantId = tenantResponse.body.tenant.id;

            const userData = {
                fullName: "Rushikesh Mungse",
                tenantId,
                role: Role.MANAGER,
            };

            const updateUserResponse = await request(app)
                .put(`/api/user/${userId}`)
                .send(userData)
                .set("Cookie", [`accessToken=${adminToken}`]);

            expect(
                (updateUserResponse.headers as Record<string, string>)[
                    "content-type"
                ],
            ).toEqual(expect.stringContaining("json"));
        });

        it("should returns the updated user id", async () => {
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

            const tenantData = {
                name: "Fudo Restaurant",
                address: "Near Sivaji Nagar, Barshi",
            };

            const adminToken = jwt.token({
                sub: "1",
                role: Role.ADMIN,
            });

            const tenantResponse = await request(app)
                .post("/api/tenant/create")
                .send(tenantData)
                .set("Cookie", [`accessToken=${adminToken}`]);

            let tenantId = tenantResponse.body.tenant.id;

            const userData = {
                fullName: "Rushikesh Mungse",
                tenantId,
                role: Role.MANAGER,
            };

            const updateUserResponse = await request(app)
                .put(`/api/user/${userId}`)
                .send(userData)
                .set("Cookie", [`accessToken=${adminToken}`]);

            const usersRepository = connection.getRepository(User);
            const users = await usersRepository.find();
            expect(users[0].fullName).toBe(userData.fullName);

            expect(updateUserResponse.body).toHaveProperty("id");
        });
    });

    describe("Missing some fields", () => {
        it("should returns the 400 status code if tenantId missing", async () => {
            const userData = {
                fullName: "Rushikesh Mungse",
            };

            const adminToken = jwt.token({
                sub: "1",
                role: Role.ADMIN,
            });

            const updateUserResponse = await request(app)
                .put(`/api/user/${1}`)
                .send(userData)
                .set("Cookie", [`accessToken=${adminToken}`]);

            expect(updateUserResponse.statusCode).toBe(400);
        });

        it("should returns the 400 status code if fullName missing", async () => {
            const userData = {
                tenantId: "1",
            };

            const adminToken = jwt.token({
                sub: "1",
                role: Role.ADMIN,
            });

            const updateUserResponse = await request(app)
                .put(`/api/user/${1}`)
                .send(userData)
                .set("Cookie", [`accessToken=${adminToken}`]);

            expect(updateUserResponse.statusCode).toBe(400);
        });

        it("should returns the 400 status code if id param missing", async () => {
            const userData = {
                tenantId: "1",
                fullName: "Rushikesh Mungse",
            };

            const adminToken = jwt.token({
                sub: "1",
                role: Role.ADMIN,
            });

            const updateUserResponse = await request(app)
                .put(`/api/user/dsfs`)
                .send(userData)
                .set("Cookie", [`accessToken=${adminToken}`]);

            expect(updateUserResponse.statusCode).toBe(400);
        });

        it("should returns the 400 status code if tenantId isNaN", async () => {
            const userData = {
                tenantId: "null",
                fullName: "Rushikesh Mungse",
            };

            const adminToken = jwt.token({
                sub: "1",
                role: Role.ADMIN,
            });

            const updateUserResponse = await request(app)
                .put(`/api/user/${1}`)
                .send(userData)
                .set("Cookie", [`accessToken=${adminToken}`]);

            expect(updateUserResponse.statusCode).toBe(400);
        });
    });
});
