import { z } from "zod";

export const authSignInSchema = z.strictObject({
    email: z.string().email(),
    password: z.string().min(8),
});

export type AuthSignInPayload = z.infer<
    typeof authSignInSchema
>;
