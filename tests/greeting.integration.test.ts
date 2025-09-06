// This file contains an integration test for the greeting API endpoint.
// It uses supertest to make HTTP requests to the Hono application.

import request from "supertest";
import app from "../src/app"; // Import the Hono app instance

describe("Greeting API Integration Test", () => {
  it("should return a greeting message from GET /greeting", async () => {
    const response = await request(app).get("/greeting");

    expect(response.status).toBe(200);
    expect(response.text).toContain("Hello from Hono!"); // Assuming default greeting
  });

  it("should create a new greeting via POST /greeting", async () => {
    const newGreetingMessage = "Integration test greeting";
    const response = await request(app).post("/greeting").send({
      message: newGreetingMessage,
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", newGreetingMessage);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("createdAt");
    expect(response.body).toHaveProperty("updatedAt");
  });
});