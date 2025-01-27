import type {user, session, company_user, company} from "@prisma/client";
import {prisma} from "~/.server/prisma";
import bcrypt from "bcryptjs";
import {createHash} from "node:crypto";
import {authTokenCookie} from "~/.server/cookies";

export function generateSessionToken(): string {
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    // base 64 encode the bytes
    return Buffer.from(bytes).toString("base64url");
}

export async function createSession(
    token: string,
    userId: number
): Promise<session> {
    const sessionId = hashToken(token);

    const session: session = {
        id: sessionId,
        userId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    };
    await prisma.session.create({
        data: session,
    });
    return session;
}

export async function getSessionFromRequest(request: Request) {
    const cookieHeader = request.headers.get("Cookie");
    const sessionToken = await authTokenCookie.parse(cookieHeader);
    if (!sessionToken) {
        return null;
    }
    return validateSessionToken(sessionToken);
}

export function hashToken(token: string): string {
    return createHash("sha256").update(token).digest("base64url");
}

export async function validateSessionToken(
    token: string
): Promise<SessionValidationResult> {
    const sessionId = hashToken(token);
    console.log('sessionId', sessionId);
    const result = await prisma.session.findUnique({
        where: {
            id: sessionId,
        },
        include: {
            user: {
                include: {
                    company_user: {
                        include: {
                            company: true
                        }
                    }
                }
            }
        },
    });
    if (result === null) {
        return {session: null, user: null};
    }
    const {user, ...session} = result;
    if (Date.now() >= session.expiresAt.getTime()) {
        await prisma.session.delete({where: {id: token}});
        return {session: null, user: null};
    }
    if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
        session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
        await prisma.session.update({
            where: {
                id: session.id,
            },
            data: {
                expiresAt: session.expiresAt,
            },
        });
    }
    return {session, user};
}

export async function invalidateSession(sessionToken: string): Promise<void> {
    const hashedToken = hashToken(sessionToken);
    await prisma.session.delete({where: {id: hashedToken}});
}

export async function verifyPassowrd(
    password: string,
    hashedPassword: string
): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

export function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 14);
}

export type SessionValidationResult =
    | { session: session; user: user & { company_user: (company_user & { company: company })[] } }
    | { session: null; user: null };
