import { createCookie } from "@remix-run/node"; // or cloudflare/deno

export const authTokenCookie = createCookie("authToken", {
    maxAge: 604_800 * 4, // one week
});