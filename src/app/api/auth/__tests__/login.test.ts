import { POST as loginHandler } from "../login/route";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

// Mock the external dependencies
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
}));

jest.mock("@/lib/jwt", () => ({
  signJWT: jest.fn(() => "mock-token"),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({ data, options })),
  },
}));

describe("Login API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if email is missing", async () => {
    const request = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ password: "password123" }),
    });

    const response = await loginHandler(request);
    expect(response.data).toEqual({ error: "Email and password are required" });
    expect(response.options.status).toBe(400);
  });

  it("should return 400 if password is missing", async () => {
    const request = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com" }),
    });

    const response = await loginHandler(request);
    expect(response.data).toEqual({ error: "Email and password are required" });
    expect(response.options.status).toBe(400);
  });

  it("should return 401 if user is not found", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
      }),
    });

    const response = await loginHandler(request);
    expect(response.data).toEqual({ error: "Invalid credentials" });
    expect(response.options.status).toBe(401);
  });

  it("should return 401 if password is invalid", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "1",
      email: "test@example.com",
      password: "hashedPassword",
      role: { id: "1", name: "user" },
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const request = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "wrongpassword",
      }),
    });

    const response = await loginHandler(request);
    expect(response.data).toEqual({ error: "Invalid credentials" });
    expect(response.options.status).toBe(401);
  });

  it("should return 200 and user data if login is successful", async () => {
    const mockUser = {
      id: "1",
      email: "test@example.com",
      password: "hashedPassword",
      fullName: "Test User",
      isActive: true,
      role: { id: "1", name: "user" },
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const request = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
      }),
    });

    const response = await loginHandler(request);
    expect(response.data.user).toEqual({
      id: mockUser.id,
      email: mockUser.email,
      fullName: mockUser.fullName,
      role: mockUser.role,
      isActive: mockUser.isActive,
    });
  });
});
