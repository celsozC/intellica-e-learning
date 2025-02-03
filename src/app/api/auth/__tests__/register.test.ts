import { POST as registerHandler } from "../register/route";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    role: {
      findFirst: jest.fn(),
    },
  },
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn(() => "hashedPassword"),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({ data, options })),
  },
}));

describe("Register API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if required fields are missing", async () => {
    const request = new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com" }),
    });

    const response = await registerHandler(request);
    expect(response.data).toEqual({ error: "All fields are required" });
    expect(response.options.status).toBe(400);
  });

  it("should return 400 if email is already taken", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "1" });

    const request = new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
        fullName: "Test User",
      }),
    });

    const response = await registerHandler(request);
    expect(response.data).toEqual({ error: "Email already taken" });
    expect(response.options.status).toBe(400);
  });

  it("should successfully register a new user", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.role.findFirst as jest.Mock).mockResolvedValue({
      id: "1",
      name: "user",
    });
    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: "1",
      email: "test@example.com",
      fullName: "Test User",
      role: { id: "1", name: "user" },
    });

    const request = new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
        fullName: "Test User",
      }),
    });

    const response = await registerHandler(request);
    expect(response.data.user).toEqual({
      id: "1",
      email: "test@example.com",
      fullName: "Test User",
      role: { id: "1", name: "user" },
    });
    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
  });
});
