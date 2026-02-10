import { z } from 'zod';

export const profileWorkCreateSchema = z.strictObject({
  plot_title: z.string(),
  synopsis: z.string(),
  type: z.string(),
  logline: z.string(),
  hook: z.string(),
  similar_works: z.string(),
  tags: z.array(z.string()),
  genres: z.array(z.string()),
  setting: z.string(),
  image: z.string().optional(),
  user_profile_work_characters: z.array(
    z.strictObject({
      name: z.string(),
      description: z.string(),
    })
  ),
});

export type ProfileWorkCreatePayload = z.infer<
  typeof profileWorkCreateSchema
>;