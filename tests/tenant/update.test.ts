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

            const updateTenantRespose = await request(app)
                .put(
                    `/api/tenant/${
                        (createTenantResponse.body.tenant as Tenant).id
                    }`,
                )
                .set("Cookie", [`accessToken=${adminToken}`])
                .send({
                    name: "Rushikesh Resto",
                    address: "Alipur Road, Barshi",
                });

            expect(updateTenantRespose.statusCode).toBe(200);
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

            const updateTenantRespose = await request(app)
                .put(
                    `/api/tenant/${
                        (createTenantResponse.body.tenant as Tenant).id
                    }`,
                )
                .set("Cookie", [`accessToken=${adminToken}`])
                .send({
                    name: "Rushikesh Resto",
                    address: "Alipur Road, Barshi",
                });

            expect(
                (updateTenantRespose.headers as Record<string, string>)[
                    "content-type"
                ],
            ).toEqual(expect.stringContaining("json"));
        });

        it("should returns the update tenant data", async () => {
            const adminToken = jwt.token({
                sub: "1",
                role: Role.ADMIN,
            });

            const createTenantResponse = await request(app)
                .post("/api/tenant/create")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(tenantData);

            const updateTenantRespose = await request(app)
                .put(
                    `/api/tenant/${
                        (createTenantResponse.body.tenant as Tenant).id
                    }`,
                )
                .set("Cookie", [`accessToken=${adminToken}`])
                .send({
                    name: "Rushikesh Resto",
                    address: "Alipur Road, Barshi",
                });

            expect(updateTenantRespose.body.tenant.name).toBe(
                "Rushikesh Resto",
            );

            expect(updateTenantRespose.body.tenant.address).toBe(
                "Alipur Road, Barshi",
            );
        });

        it("should returns the 400 status code if id is not found!", async () => {
            const adminToken = jwt.token({
                sub: "1",
                role: Role.ADMIN,
            });

            const getTenantResponse = await request(app)
                .put(`/api/tenant/90`)
                .set("Cookie", [`accessToken=${adminToken}`])
                .send({
                    name: "Rushikesh Resto",
                    address: "Alipur Road, Barshi",
                });

            expect(getTenantResponse.statusCode).toBe(400);
        });

        it("should returns the 403 status code if user is not admin", async () => {
            const adminToken = jwt.token({
                sub: "1",
                role: Role.MANAGER,
            });

            const getTenantResponse = await request(app)
                .put(`/api/tenant/9`)
                .set("Cookie", [`accessToken=${adminToken}`])
                .send({
                    name: "Rushikesh Resto",
                    address: "Alipur Road, Barshi",
                });

            expect(getTenantResponse.statusCode).toBe(403);
        });

        it("should returns the 400 status code if id is not in params!", async () => {
            const adminToken = jwt.token({
                sub: "1",
                role: Role.ADMIN,
            });

            const getTenantResponse = await request(app)
                .put(`/api/tenant/eriuw`)
                .set("Cookie", [`accessToken=${adminToken}`])
                .send({
                    name: "Rushikesh Resto",
                    address: "Alipur Road, Barshi",
                });

            expect(getTenantResponse.statusCode).toBe(400);
        });
    });

    describe("Missing some fields", () => {
        it("should returns the 400 status code if address missing", async () => {
            const adminToken = jwt.token({
                sub: "1",
                role: Role.ADMIN,
            });

            const createTenantResponse = await request(app)
                .post("/api/tenant/create")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(tenantData);

            const updateTenantRespose = await request(app)
                .put(
                    `/api/tenant/${
                        (createTenantResponse.body.tenant as Tenant).id
                    }`,
                )
                .set("Cookie", [`accessToken=${adminToken}`])
                .send({
                    name: "Rushikesh Resto",
                    address: "",
                });

            expect(updateTenantRespose.statusCode).toBe(400);
        });

        it("should returns the 400 status code if name missing", async () => {
            const adminToken = jwt.token({
                sub: "1",
                role: Role.ADMIN,
            });

            const createTenantResponse = await request(app)
                .post("/api/tenant/create")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(tenantData);

            const updateTenantRespose = await request(app)
                .put(
                    `/api/tenant/${
                        (createTenantResponse.body.tenant as Tenant).id
                    }`,
                )
                .set("Cookie", [`accessToken=${adminToken}`])
                .send({
                    name: "",
                    address: "Alipur road, Barshi",
                });

            expect(updateTenantRespose.statusCode).toBe(400);
        });
    });
});
