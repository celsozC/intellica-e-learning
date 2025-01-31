import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "INTELLICA_SECRET"; // Use a secure secret in .env

interface JWTPayload {
  id: string;
  email: string;
  fullName: string;
  role: {
    id: string;
    name: string;
  };
  isActive: boolean;
  iat?: number;
  exp?: number;
}

export function signJWT(payload: Omit<JWTPayload, "iat" | "exp">) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    console.error("JWT Verify Error:", error);
    return null;
  }
}
