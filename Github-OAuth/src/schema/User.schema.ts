import { z } from 'zod';

export enum RoleEnum {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export enum ProviderEnum {
  LOCAL = 'LOCAL',
  GITHUB = 'GITHUB',
  GOOGLE = 'GOOGLE'
}

export enum UserTypeEnum {
  STUDENT = 'STUDENT',
  PROFESSIONAL = 'PROFESSIONAL'
}

export const Role = z.nativeEnum(RoleEnum);
export const Provider = z.nativeEnum(ProviderEnum);
export const UserType = z.nativeEnum(UserTypeEnum);

// Base user schema
const userCore = {
  email: z.string({
    required_error: 'Email is required',
    invalid_type_error: 'Email must be a string'
  }).email({ message: 'Invalid email format' }),
  name: z.string({
    required_error: 'Name is required',
    invalid_type_error: 'Name must be a string'
  }).min(2, { message: 'Name must be at least 2 characters' }),
  phoneNumber: z.string({
    required_error: 'Phone number is required'
  }).min(10, { message: 'Phone number must be at least 10 digits' })
    .max(15, { message: 'Phone number must not exceed 15 digits' })
    .optional(),
  photo: z.string().optional(),
  role: Role.optional(),
  provider: Provider.optional(),
  userType: UserType.optional(),
};


export const createUserSchema = z.object({
  body: z.object({
    ...userCore,
    password: z.string({
      required_error: 'Password is required'
    }).min(8, { message: 'Password must be at least 8 characters long' })
      .max(100, { message: 'Password is too long' })
      .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
      .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
      .regex(/[0-9]/, { message: 'Password must contain at least one number' })
      .regex(/[^a-zA-Z0-9]/, { message: 'Password must contain at least one special character' }),
    passwordConfirm: z.string({
      required_error: 'Please confirm your password'
    }),
    verified: z.boolean().optional().default(false),
  }).refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  })
});

// Login schema
export const loginUserSchema = z.object({
  body: z.object({
    email: z.string({
      required_error: 'Email is required'
    }).email({ message: 'Invalid email format' }),
    password: z.string({
      required_error: 'Password is required'
    }).min(8, { message: 'Password must be at least 8 characters long' })
  })
});

// OAuth login schema
export const oauthLoginSchema = z.object({
  body: z.object({
    email: z.string().email({ message: 'Invalid email format' }),
    name: z.string().optional(),
    provider: Provider,
    providerId: z.string(),
    photo: z.string().optional()
  })
});

// User update schema
export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phoneNumber: z.string().min(10).max(15).optional(),
    photo: z.string().optional(),
    userType: UserType.optional(),
  })
});

// Password change schema
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string({
      required_error: 'Current password is required'
    }),
    newPassword: z.string({
      required_error: 'New password is required'
    }).min(8, { message: 'Password must be at least 8 characters long' })
      .max(100, { message: 'Password is too long' })
      .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
      .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
      .regex(/[0-9]/, { message: 'Password must contain at least one number' })
      .regex(/[^a-zA-Z0-9]/, { message: 'Password must contain at least one special character' }),
    passwordConfirm: z.string({
      required_error: 'Please confirm your password'
    }),
  }).refine((data) => data.newPassword === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  })
});

// Profile Schema
export const createProfileSchema = z.object({
  body: z.object({
    bio: z.string().max(1000, { message: 'Bio should not exceed 1000 characters' }).optional(),
    city: z.string().max(100, { message: 'City name is too long' }).optional(),
  })
});

// Education Schema
export const createEducationSchema = z.object({
  body: z.object({
    institution: z.string({ required_error: 'Institution name is required' }),
    degree: z.string().optional(),
    field: z.string().optional(),
    startYear: z.number({ required_error: 'Start year is required' })
      .int()
      .min(1900, { message: 'Invalid start year' })
      .max(new Date().getFullYear(), { message: 'Start year cannot be in the future' }),
    endYear: z.number()
      .int()
      .min(1900, { message: 'Invalid end year' })
      .max(new Date().getFullYear() + 10, { message: 'End year too far in the future' })
      .optional(),
    current: z.boolean().optional().default(false),
  }).refine(
    (data) => !data.endYear || data.startYear <= data.endYear,
    {
      message: 'End year must be after start year',
      path: ['endYear']
    }
  )
});

// Work Experience Schema
export const createWorkExperienceSchema = z.object({
  body: z.object({
    company: z.string({ required_error: 'Company name is required' }),
    position: z.string({ required_error: 'Position is required' }),
    city: z.string().optional(),
    startDate: z.coerce.date({ required_error: 'Start date is required' }),
    endDate: z.coerce.date().optional(),
    current: z.boolean().optional().default(false),
  }).refine(
    (data) => !data.endDate || data.startDate <= data.endDate,
    {
      message: 'End date must be after start date',
      path: ['endDate']
    }
  )
});

// Export types for TypeScript usage
export type CreateUserInput = {
    name: string;
    email: string;
    password: string;
    userType: typeof UserTypeEnum; // Add userType field
};
export type LoginUserInput = z.infer<typeof loginUserSchema>['body'];
export type OAuthLoginInput = z.infer<typeof oauthLoginSchema>['body'];
export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];
export type CreateProfileInput = z.infer<typeof createProfileSchema>['body'];
export type CreateEducationInput = z.infer<typeof createEducationSchema>['body'];
export type CreateWorkExperienceInput = z.infer<typeof createWorkExperienceSchema>['body'];
