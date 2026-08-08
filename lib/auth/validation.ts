import { z } from 'zod';

// Cameroon local mobile format: 9 digits starting with 6, e.g. 6XXXXXXXX.
// Assumption: we only accept local 9-digit input in the UI and normalize to
// E.164-ish +2376XXXXXXXX internally; only the normalized form is ever stored.
export const CM_LOCAL_PHONE_REGEX = /^6\d{8}$/;
export const CM_NORMALIZED_PHONE_REGEX = /^\+2376\d{8}$/;

export function normalizeCameroonPhone(localNumber: string): string {
  const digits = localNumber.replace(/\D/g, '');
  return `+237${digits}`;
}

export function isValidLocalCameroonPhone(localNumber: string): boolean {
  return CM_LOCAL_PHONE_REGEX.test(localNumber.trim());
}

const pinSchema = z
  .string()
  .length(4, 'PIN must be exactly 4 digits')
  .regex(/^\d{4}$/, 'PIN must be numeric');

export const signupSchema = z
  .object({
    name: z.string().trim().min(2, 'Name is too short').max(80, 'Name is too long'),
    phone: z
      .string()
      .trim()
      .regex(CM_LOCAL_PHONE_REGEX, 'Enter a valid Cameroon WhatsApp number (6XXXXXXXX)'),
    pin: pinSchema,
    confirmPin: pinSchema,
  })
  .refine((data) => data.pin === data.confirmPin, {
    message: 'PIN and confirmation do not match',
    path: ['confirmPin'],
  });

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(CM_LOCAL_PHONE_REGEX, 'Enter a valid Cameroon WhatsApp number (6XXXXXXXX)'),
  pin: pinSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
