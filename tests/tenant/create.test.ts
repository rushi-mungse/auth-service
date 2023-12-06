import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config";
import { Tenant } from "../../src/entity";
import createJwtMock from "mock-jwks";
import { Role } from "../../src/constants";

describe("POST /api/tenant/create", () => {
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

            const tenantResponse = await request(app)
                .post("/api/tenant/create")
                .send(tenantData)
                .set("Cookie", [`accessToken=${adminToken}`]);

            expect(tenantResponse.statusCode).toBe(200);
        });

        it("should returns json data", async () => {
            const adminToken = jwt.token({
                sub: "1",
                role: Role.ADMIN,
            });

            const tenantResponse = await request(app)
                .post("/api/tenant/create")
                .send(tenantData)
                .set("Cookie", [`accessToken=${adminToken}`]);

            expect(
                (tenantResponse.headers as Record<string, string>)[
                    "content-type"
                ],
            ).toEqual(expect.stringContaining("json"));
        });

        it("should persist tenant in database", async () => {
            const adminToken = jwt.token({
                sub: "1",
                role: Role.ADMIN,
            });

            await request(app)
                .post("/api/tenant/create")
                .send(tenantData)
                .set("Cookie", [`accessToken=${adminToken}`]);

            const tenantsRepository = connection.getRepository(Tenant);
            const tenants = await tenantsRepository.find();

            expect(tenants).toHaveLength(1);
        });

        it("should returns tenant data", async () => {
            const adminToken = jwt.token({
                sub: "1",
                role: Role.ADMIN,
            });
            await request(app)
                .post("/api/tenant/create")
                .send(tenantData)
                .set("Cookie", [`accessToken=${adminToken}`]);

            const tenantsRepository = connection.getRepository(Tenant);
            const tenants = await tenantsRepository.find();

            expect(tenants[0].name).toBe(tenantData.name);
            expect(tenants[0].address).toBe(tenantData.address);
        });
    });

    describe("Some missing fields", () => {
        it("should return 400 status code if missing address field", async () => {
            const tenantData = {
                name: "Fudo Restaurant",
            };

            const adminToken = jwt.token({
                sub: "1",
                role: Role.ADMIN,
            });

            const tenantResponse = await request(app)
                .post("/api/tenant/create")
                .send(tenantData)
                .set("Cookie", [`accessToken=${adminToken}`]);

            expect(tenantResponse.statusCode).toBe(400);
        });

        it("should return 400 status code if missing name field", async () => {
            const tenantData = {
                address: "Street 87, NY",
            };

            const adminToken = jwt.token({
                sub: "1",
                role: Role.ADMIN,
            });

            const tenantResponse = await request(app)
                .post("/api/tenant/create")
                .send(tenantData)
                .set("Cookie", [`accessToken=${adminToken}`]);

            expect(tenantResponse.statusCode).toBe(400);
        });
    });
});
