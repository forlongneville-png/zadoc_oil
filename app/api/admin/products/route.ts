import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin/authorize';
import { listProducts, createProduct, updateProduct } from '@/lib/admin/db';

export async function GET(req: NextRequest) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status });

  return NextResponse.json({ products: await listProducts() });
}

const imageSchema = z.object({ image_url: z.string().min(1), display_order: z.number() });

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  benefits: z.array(z.string().min(1)).min(1),
  usage: z.string().min(1),
  warnings: z.string().default(''),
  avoid_reason: z.string().default(''),
  skin_type_compatibility: z.array(z.enum(['dry', 'oily', 'combination', 'normal', 'sensitive'])).default([]),
  active: z.boolean().default(true),
  images: z.array(imageSchema).min(1).max(5),
});

export async function POST(req: NextRequest) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status });

  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const product = await createProduct(parsed.data);
  return NextResponse.json({ product }, { status: 201 });
}

const updateSchema = productSchema.partial().extend({ id: z.string().min(1) });

export async function PATCH(req: NextRequest) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { id, ...patch } = parsed.data;
  try {
    const product = await updateProduct(id, patch);
    return NextResponse.json({ product });
  } catch {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
}
