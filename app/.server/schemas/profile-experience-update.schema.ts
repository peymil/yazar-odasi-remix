import { z } from 'zod';
import { profileExperienceCreateSchema } from '~/.server/schemas/profile-experience-create.schema';

export const profileExperienceUpdateSchema =
  profileExperienceCreateSchema.partial();

export type ProfileExperienceUpdatePayload = z.infer<
  typeof profileExperienceUpdateSchema
>;
