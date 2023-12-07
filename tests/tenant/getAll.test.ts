import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config";
import createJwtMock from "mock-jwks";
import { Role } from "../../src/constants";

describe("GET /api/tenant", () => {
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

    const tenantData = {
        name: "Fudo Restaurant",
        address: "Near Sivaji Nagar, Barshi",
    };

    describe("Given all fields", () => {
        it("should returns the 200 status code", async () => {
            const adminToken = jwt.token({
                sub: "1",
                role: Role.ADMIN,
            });

            const getTenantResponse = await request(app)
                .get("/api/tenant")
                .set("Cookie", [`accessToken=${adminToken}`]);

            expect(getTenantResponse.statusCode).toBe(200);
        });

        it("should returns json data", async () => {
            const adminToken = jwt.token({
                sub: "1",
                role: Role.ADMIN,
            });

            const getTenantResponse = await request(app)
                .get("/api/tenant")
                .set("Cookie", [`accessToken=${adminToken}`]);

            expect(
                (getTenantResponse.headers as Record<string, string>)[
                    "content-type"
                ],
            ).toEqual(expect.stringContaining("json"));
        });

        it("should return all tenants", async () => {
            const adminToken = jwt.token({
                sub: "1",
                role: Role.ADMIN,
            });

            await request(app)
                .post("/api/tenant/create")
                .send(tenantData)
                .set("Cookie", [`accessToken=${adminToken}`]);

            const getTenantResponse = await request(app)
                .get("/api/tenant")
                .set("Cookie", [`accessToken=${adminToken}`]);

            expect(getTenantResponse.body.tenants).toHaveLength(1);
        });

        it("should return 403 status code if permission not allowed!", async () => {
            const adminToken = jwt.token({
                sub: "1",
                role: Role.MANAGER,
            });

            const getTenantResponse = await request(app)
                .get("/api/tenant")
                .set("Cookie", [`accessToken=${adminToken}`]);

            expect(getTenantResponse.statusCode).toBe(403);
        });
    });
});
