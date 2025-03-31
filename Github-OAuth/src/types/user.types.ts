import { z } from 'zod';

export const SignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
  phoneNumber: z.string().min(10),
  name: z.string().min(2),
  userType: z.enum(['STUDENT', 'PROFESSIONAL'])
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export const ProfileSchema = z.object({
  bio: z.string().optional(),
  city: z.string().optional(),
  photo: z.string().optional()
});

export const EducationSchema = z.object({
  institution: z.string(),
  degree: z.string().optional(),
  field: z.string().optional(),
  startYear: z.number(),
  endYear: z.number().optional(),
  current: z.boolean().default(false)
});

export const WorkExperienceSchema = z.object({
  company: z.string(),
  position: z.string(),
  city: z.string().optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
  current: z.boolean().default(false)
});

export type SignUpInput = z.infer<typeof SignUpSchema>;
export type SignInInput = z.infer<typeof SignInSchema>;
export type ProfileInput = z.infer<typeof ProfileSchema>;
export type EducationInput = z.infer<typeof EducationSchema>;
export type WorkExperienceInput = z.infer<typeof WorkExperienceSchema>;
