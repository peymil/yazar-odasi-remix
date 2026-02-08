import { z } from 'zod';

export const profileWorkUpdateSchema = z.strictObject({
  plot_title: z.string(),
  synopsis: z.string(),
  type: z.string(),
  logline: z.string(),
  hook: z.string(),
  similar_works: z.string(),
  setting: z.string(),
  genres: z.array(z.string()),
  tags: z.array(z.string()),
  user_profile_work_characters: z.array(
    z.strictObject({
      name: z.string(),
      description: z.string(),
    })
  ),
});

export type ProfileWorkUpdatePayload = z.infer<
  typeof profileWorkUpdateSchema
>;