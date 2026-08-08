import { z } from 'zod';

export const ageSchema = z
  .number({ invalid_type_error: 'Please enter a valid age.' })
  .int('Age must be a whole number.')
  .min(1, 'Age must be at least 1.')
  .max(120, 'Age must be 120 or under.');

export const genderSchema = z.enum(['female', 'male', 'prefer_not_to_say']);
export const routineSchema = z.enum(['none', 'simple', 'moderate', 'detailed']);
export const conditionAnswerSchema = z.enum(['no', 'yes', 'not_sure']);

// Accepted image MIME types for the captured scan photo.
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const analyzeRequestSchema = z.object({
  image: z
    .string()
    .min(1, 'An image is required.')
    .refine((val) => val.startsWith('data:image/'), 'Image must be a base64 data URL.')
    .refine((val) => {
      const mime = val.substring(5, val.indexOf(';'));
      return ACCEPTED_IMAGE_TYPES.includes(mime);
    }, 'Unsupported image type.'),
  age: ageSchema,
  gender: genderSchema,
  routine: routineSchema,
  conditionAnswer: conditionAnswerSchema,
  conditionDescription: z.string().max(500).nullable().optional(),
});

export type AnalyzeRequestPayload = z.infer<typeof analyzeRequestSchema>;
