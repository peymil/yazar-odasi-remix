import { z } from "zod";

export const authSignUpSchema = z.strictObject({
  email: z.string().email(),
  name: z.string(),
  password: z.string().min(8),
});

export type AuthSignUpPayload = z.infer<typeof authSignUpSchema>;
