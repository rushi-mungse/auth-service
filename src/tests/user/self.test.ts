import request from "supertest";
import app from "../../app";
import createJwtMock from "mock-jwks";
import { User } from "../../entity/User";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../config/appDataSource";
import { Role } from "../../constants";
import { SendOtpRequest } from "../../types";

describe("GET /api/auth/self", () => {
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

    afterAll(async () => {
        await connection.destroy();
    });

    it("should return 200 status code", async () => {
        const accessToken = jwt.token({
            sub: "1",
            role: Role.CUSTOMER,
        });

        const response = await request(app)
            .get("/api/auth/self")
            .set("Cookie", [`accessToken=${accessToken};`]);

        expect(response.statusCode).toBe(200);
    });

    it("should check tokens is valid", async () => {
        const userData = {
            fullName: "Rushikesh Mungse",
            email: "mungse.rushi@gmail.com",
            password: "123456789",
            confirmPassword: "123456789",
        };

        const res = await request(app)
            .post("/api/auth/register/send-otp")
            .send(userData);

        const data = await request(app)
            .post("/api/auth/register/verify-otp")
            .send({
                ...(res.body as SendOtpRequest),
                fullName: " Rushikesh Mungse ",
            });

        const accessToken = jwt.token({
            sub: String((data.body as User).id),
            role: Role.CUSTOMER,
        });

        const self = await request(app)
            .get("/api/auth/self")
            .set("Cookie", [`accessToken=${accessToken};`]);

        expect((self.body as User).id).toBe((data.body as User).id);
    });
});
