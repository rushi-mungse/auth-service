import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config";
import { Tenant } from "../../src/entity";
import { Tenant as TenantDtoData } from "../../src/types";
import createJwtMock from "mock-jwks";
import { Role } from "../../src/constants";

describe("DELETE /api/tenant/id", () => {
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

            const deletTenantResponse = await request(app)
                .delete(
                    `/api/tenant/${
                        (tenantResponse.body.tenant as TenantDtoData).id
                    }`,
                )
                .set("Cookie", [`accessToken=${adminToken}`]);

            expect(deletTenantResponse.statusCode).toBe(200);
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

            const deletTenantResponse = await request(app)
                .delete(
                    `/api/tenant/${
                        (tenantResponse.body.tenant as TenantDtoData).id
                    }`,
                )
                .set("Cookie", [`accessToken=${adminToken}`]);

            expect(
                (deletTenantResponse.headers as Record<string, string>)[
                    "content-type"
                ],
            ).toEqual(expect.stringContaining("json"));
        });

        it("should persist tenant in database", async () => {
            const adminToken = jwt.token({
                sub: "1",
                role: Role.ADMIN,
            });

            const tenantResponse = await request(app)
                .post("/api/tenant/create")
                .send(tenantData)
                .set("Cookie", [`accessToken=${adminToken}`]);

            await request(app)
                .delete(
                    `/api/tenant/${
                        (tenantResponse.body.tenant as TenantDtoData).id
                    }`,
                )
                .set("Cookie", [`accessToken=${adminToken}`]);

            const tenantsRepository = connection.getRepository(Tenant);
            const tenants = await tenantsRepository.find();

            expect(tenants).toHaveLength(0);
        });

        it("should returns tenant id", async () => {
            const adminToken = jwt.token({
                sub: "1",
                role: Role.ADMIN,
            });
            const tenantResponse = await request(app)
                .post("/api/tenant/create")
                .send(tenantData)
                .set("Cookie", [`accessToken=${adminToken}`]);

            const deletTenantResponse = await request(app)
                .delete(
                    `/api/tenant/${
                        (tenantResponse.body.tenant as TenantDtoData).id
                    }`,
                )
                .set("Cookie", [`accessToken=${adminToken}`]);

            expect(deletTenantResponse.body).toHaveProperty("id");
        });
    });

    describe("Some missing fields", () => {
        it("should return 400 status code if missing tenant id", async () => {
            const adminToken = jwt.token({
                sub: "1",
                role: Role.ADMIN,
            });
            await request(app)
                .post("/api/tenant/create")
                .send(tenantData)
                .set("Cookie", [`accessToken=${adminToken}`]);

            const deletTenantResponse = await request(app)
                .delete(`/api/tenant/dfsdfsd`)
                .set("Cookie", [`accessToken=${adminToken}`]);

            expect(deletTenantResponse.statusCode).toBe(400);
        });
    });
});
