import request from "supertest";
import app from "../../src/app";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config";

describe("POST /api/tenant/create", () => {
    let connection: DataSource;
    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterAll(async () => {
        await connection?.destroy();
    });

    const tenantData = {
        name: "Fudo Restaurant",
        address: "Near Sivaji Nagar, Barshi",
        rating: 0,
    };

    describe("Given all fields", () => {
        it("should returns the 200 status code", async () => {
            const tenantResponse = await request(app)
                .post("/api/tenant/create")
                .send(tenantData);
            expect(tenantResponse.statusCode).toBe(200);
        });
    });
});
