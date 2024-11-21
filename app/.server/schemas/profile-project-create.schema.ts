import { z } from "zod";

export const profileProjectCreateSchema = z.strictObject({
  plot_title: z.string(),
  synopsis: z.string(),
  type: z.string(),
  logline: z.string(),
  hook: z.string(),
  similar_works: z.string(),
  tags: z.array(z.string()),
  genres: z.array(z.string()),
});

export type ProfileProjectCreatePayload = z.infer<
  typeof profileProjectCreateSchema
>;
