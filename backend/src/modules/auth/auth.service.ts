import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { hashPassword, verifyPassword } from "../../utils/password.js";
import { v4 as uuid } from "uuid";

interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
}

// MVP in-memory user store; replace with Postgres
const users = new Map<string, UserRecord>();

export async function register(email: string, password: string) {
  if (users.has(email)) {
    throw new Error("User exists");
  }
  const passwordHash = await hashPassword(password);
  const user: UserRecord = { id: uuid(), email, passwordHash };
  users.set(email, user);
  return signToken(user);
}

export async function login(email: string, password: string) {
  const user = users.get(email);
  if (!user) {
    throw new Error("Invalid credentials");
  }
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    throw new Error("Invalid credentials");
  }
  return signToken(user);
}

function signToken(user: UserRecord) {
  return jwt.sign({ id: user.id, email: user.email }, env.JWT_SECRET, {
    expiresIn: "12h",
  });
}
