import { z } from 'zod';

export const profileUpdateSchema = z.strictObject({
  about: z.string().optional(),
  background_image: z.string().url().optional(),
  profile_picture: z.string().url().optional(),
});

export type ProfileUpdatePayload = z.infer<typeof profileUpdateSchema>;
