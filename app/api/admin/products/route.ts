// ROUTE: app/api/admin/products/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { productSchema } from '@/lib/admin/productSchema';
import { requireAdmin } from '@/lib/admin/auth';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .select(
      'id, name, slug, description, category, benefits, usage, warnings, active, created_at, ' +
        'product_images(image_url, display_order), ' +
        'product_recommendations(id, skin_type, recommendation_type, rank, reason)'
    )
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data ?? [] });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = productSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid product data' },
      { status: 400 }
    );
  }

  const { images, recommendations, ...productFields } = parsed.data;

  const { data: existing } = await supabaseAdmin
    .from('products')
    .select('id')
    .eq('slug', productFields.slug)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: `Slug "${productFields.slug}" is already in use` }, { status: 409 });
  }

  const { data: product, error: productError } = await supabaseAdmin
    .from('products')
    .insert(productFields)
    .select('id')
    .single();

  if (productError || !product) {
    return NextResponse.json({ error: productError?.message ?? 'Failed to create product' }, { status: 500 });
  }

  const productId = product.id as string;

  if (images.length > 0) {
    const { error: imagesError } = await supabaseAdmin
      .from('product_images')
      .insert(images.map((img) => ({ ...img, product_id: productId })));

    if (imagesError) {
      return NextResponse.json(
        { error: `Product created but images failed: ${imagesError.message}`, productId },
        { status: 207 }
      );
    }
  }

  if (recommendations.length > 0) {
    const { error: recError } = await supabaseAdmin
      .from('product_recommendations')
      .insert(recommendations.map((rec) => ({ ...rec, product_id: productId })));

    if (recError) {
      return NextResponse.json(
        { error: `Product + images created but recommendations failed: ${recError.message}`, productId },
        { status: 207 }
      );
    }
  }

  return NextResponse.json({ productId }, { status: 201 });
}