import * as crypto from "crypto";
import { AppLoadContext } from "@remix-run/node";
import { prisma } from "~/.server/prisma";
import { authTokenCookie } from "~/.server/cookies";

export function createSessionToken() {
  return crypto.randomBytes(20).toString("base64");
}

export function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("base64");
}

export function verifyPassword(password: string, hash: string) {
  return hashPassword(password) === hash;
}

export async function getUserWithRequest(req: Request) {
  const cookie = await authTokenCookie.parse(req.headers.get("Cookie"));
  const session = await prisma.session.findUnique({
    where: {
      id: cookie,
      expiresAt: {
        gte: new Date(),
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!session) {
    return null;
  }
  return session.user;
}
