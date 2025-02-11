import { z } from 'zod';

export const profileExperienceCreateSchema = z.strictObject({
  location: z.string(),
  start_date: z.date(),
  end_date: z.date(),
  description: z.string(),
  title: z.string(),
  company_name: z.string(),
});

export type ProfileExperienceCreatePayload = z.infer<
  typeof profileExperienceCreateSchema
>;
