import request from "supertest";
import app from "../../app";
import createJwtMock from "mock-jwks";
import { User } from "../../entity";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../config";
import { Role } from "../../constants";
import { SendOtpRequest, VerifyOtpData } from "../../types";

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

    const userData = {
        fullName: "Rushikesh Mungse",
        email: "mungse.rushi@gmail.com",
        password: "rushi@123",
        confirmPassword: "rushi@123",
    };

    it.skip("should return 200 status code", async () => {
        const sendOtpResponse = await request(app)
            .post("/api/auth/register/send-otp")
            .send(userData);

        const response = await request(app)
            .post("/api/auth/register/verify-otp")
            .send(sendOtpResponse.body as VerifyOtpData);
        interface Headers {
            ["set-cookie"]: string[];
        }

        let accessToken = null;
        let refreshToken = null;

        const cookies =
            (response.headers as unknown as Headers)["set-cookie"] || [];

        cookies.forEach((cookie) => {
            if (cookie.startsWith("accessToken"))
                accessToken = cookie.split(";")[0].split("=")[1];
            if (cookie.startsWith("refreshToken"))
                refreshToken = cookie.split(";")[0].split("=")[1];
        });

        const selfResponse = await request(app)
            .get("/api/auth/self")
            .set("Cookie", [
                `refreshToken=${refreshToken};`,
                `accessToken=${accessToken};`,
            ]);
        expect(selfResponse.statusCode).toBe(200);
    });

    it("should return 401 status code if unauthorized user found", async () => {
        const accessToken = "dfsdfsdf";
        const response = await request(app)
            .get("/api/auth/self")
            .set("Cookie", [`accessToken=${accessToken}`]);

        expect(response.statusCode).toBe(401);
    });

    it.skip("should check tokens is valid", async () => {
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
            .send(sendOtpResponse.body as SendOtpRequest);

        const accessToken = jwt.token({
            sub: String((verifyOtpResponse.body as User).id),
            role: Role.CUSTOMER,
        });

        const self = await request(app)
            .get("/api/auth/self")
            .set("Cookie", [`accessToken=${accessToken}`, ``]);

        expect((self.body as User).id).toBe(
            (verifyOtpResponse.body as User).id,
        );
    });
});
