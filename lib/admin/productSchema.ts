// FILE PATH: lib/admin/productSchema.ts
import { z } from 'zod';

// Validation for the internal /add_products tool. Mirrors the shape of
// `products`, `product_images`, and `product_recommendations` from
// ZADOC_SCHEMA_REFERENCE.md exactly, so anything that passes this schema is
// guaranteed to insert cleanly.

export const skinTypeEnum = z.enum(['dry', 'oily', 'combination', 'normal', 'sensitive']);
export const recommendationTypeEnum = z.enum(['best', 'avoid']);

export const recommendationSchema = z.object({
  skin_type: skinTypeEnum,
  recommendation_type: recommendationTypeEnum,
  rank: z.number().int().min(1).max(10),
  reason: z.string().trim().max(500).optional().default(''),
});

export const productImageSchema = z.object({
  image_url: z.string().url(),
  display_order: z.number().int().min(0).max(4),
});

export const productSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required')
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  description: z.string().trim().max(2000).optional().default(''),
  category: z.string().trim().max(120).optional().default(''),
  benefits: z.array(z.string().trim().min(1)).max(20).optional().default([]),
  usage: z.string().trim().max(1000).optional().default(''),
  warnings: z.string().trim().max(1000).optional().default(''),
  active: z.boolean().optional().default(true),
  images: z.array(productImageSchema).max(5).optional().default([]),
  recommendations: z.array(recommendationSchema).max(20).optional().default([]),
});

export const jsonImportSchema = z.array(productSchema).max(100);

export type ProductInput = z.infer<typeof productSchema>;