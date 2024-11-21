import { z } from "zod";
import { profileProjectCreateSchema } from "~/.server/schemas/profile-project-create.schema";

export const profileProjectUpdateSchema = profileProjectCreateSchema.partial();

export type ProfileProjectUpdatePayload = z.infer<
  typeof profileProjectUpdateSchema
>;
