import request from "supertest";
import app from "../../src/app";

describe("POST /api/auth/register", () => {
    describe("Given all fields", () => {
        it("should returns the 201 status code", async () => {
            // AAA Principle
            const userData = {
                fullName: "Rushikesh Mungse",
                email: "mungse.rushi@gmail.com",
                password: "secret",
                confirmPassword: "secret",
            };

            const response = await request(app)
                .post("/api/auth/register")
                .send(userData);

            expect(response.statusCode).toBe(201);
        });
    });

    describe("Some fields are missing", () => {});
});
