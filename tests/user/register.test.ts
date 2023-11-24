import request from "supertest";
import app from "../../src/app";

describe("POST /api/auth/register", () => {
    describe("Given all fields", () => {
        const userData = {
            fullName: "Rushikesh Mungse",
            email: "mungse.rushi@gmail.com",
            password: "secret",
            confirmPassword: "secret",
        };

        it("should returns the 201 status code", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send(userData);

            expect(response.statusCode).toBe(201);
        });

        it("should returns json response", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send(userData);

            expect(
                (response.headers as Record<string, string>)["content-type"],
            ).toEqual(expect.stringContaining("json"));
        });
    });

    describe("Some fields are missing", () => {});
});
