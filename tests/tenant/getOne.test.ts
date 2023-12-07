import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config";
import createJwtMock from "mock-jwks";
import { Role } from "../../src/constants";
import { Tenant } from "../../src/types";

describe("GET /api/tenant/id", () => {
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

            const createTenantResponse = await request(app)
                .post("/api/tenant/create")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(tenantData);

            const getTenantResponse = await request(app)
                .get(
                    `/api/tenant/${
                        (createTenantResponse.body.tenant as Tenant).id
                    }`,
                )
                .set("Cookie", [`accessToken=${adminToken}`]);

            expect(getTenantResponse.statusCode).toBe(200);
        });

        it("should returns the json status code", async () => {
            const adminToken = jwt.token({
                sub: "1",
                role: Role.ADMIN,
            });

            const createTenantResponse = await request(app)
                .post("/api/tenant/create")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(tenantData);

            const getTenantResponse = await request(app)
                .get(
                    `/api/tenant/${
                        (createTenantResponse.body.tenant as Tenant).id
                    }`,
                )
                .set("Cookie", [`accessToken=${adminToken}`]);

            expect(
                (getTenantResponse.headers as Record<string, string>)[
                    "content-type"
                ],
            ).toEqual(expect.stringContaining("json"));
        });

        it("should returns the tenant data", async () => {
            const adminToken = jwt.token({
                sub: "1",
                role: Role.ADMIN,
            });

            const createTenantResponse = await request(app)
                .post("/api/tenant/create")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(tenantData);

            const getTenantResponse = await request(app)
                .get(
                    `/api/tenant/${
                        (createTenantResponse.body.tenant as Tenant).id
                    }`,
                )
                .set("Cookie", [`accessToken=${adminToken}`]);

            expect(getTenantResponse.body.tenant as Tenant).toHaveProperty(
                "id",
            );
            expect(getTenantResponse.body.tenant as Tenant).toHaveProperty(
                "rating",
            );
            expect(getTenantResponse.body.tenant as Tenant).toHaveProperty(
                "name",
            );
            expect(getTenantResponse.body.tenant as Tenant).toHaveProperty(
                "address",
            );
        });

        it("should returns the null tenant data if id is not found!", async () => {
            const adminToken = jwt.token({
                sub: "1",
                role: Role.ADMIN,
            });

            const getTenantResponse = await request(app)
                .get(`/api/tenant/90`)
                .set("Cookie", [`accessToken=${adminToken}`]);

            expect(getTenantResponse.body.tenant).toBeNull();
        });

        it("should returns the 403 status code if user is not admin", async () => {
            const adminToken = jwt.token({
                sub: "1",
                role: Role.MANAGER,
            });

            const getTenantResponse = await request(app)
                .get(`/api/tenant/9`)
                .set("Cookie", [`accessToken=${adminToken}`]);

            expect(getTenantResponse.statusCode).toBe(403);
        });

        it("should returns the 403 status code if id is not in params!", async () => {
            const adminToken = jwt.token({
                sub: "1",
                role: Role.ADMIN,
            });

            const getTenantResponse = await request(app)
                .get(`/api/tenant/eriuw`)
                .set("Cookie", [`accessToken=${adminToken}`]);

            expect(getTenantResponse.statusCode).toBe(400);
        });
    });
});
