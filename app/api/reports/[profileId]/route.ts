import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import React from 'react';
import { renderToBuffer, DocumentProps } from '@react-pdf/renderer';
import { ReportDocument } from '@/lib/pdf/ReportDocument';
import { getSessionUserId } from '@/lib/auth/session';
import { getProfileForUser } from '@/lib/profiles/db';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { signProfileImageUrl } from '@/lib/storage/profile-images';
import type { ProductRecommendation } from '@/types/zadoc';

export const runtime = 'nodejs'; // @react-pdf/renderer needs the Node runtime, not edge

function fileToDataUri(relPath: string): string {
  const abs = path.join(process.cwd(), 'public', relPath);
  const buf = fs.readFileSync(abs);
  const ext = path.extname(abs).slice(1);
  const mime = ext === 'jpeg' || ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
  return `data:${mime};base64,${buf.toString('base64')}`;
}

async function urlToDataUri(url: string): Promise<string> {
  const res = await fetch(url);
  const buf = Buffer.from(await res.arrayBuffer());
  const mime = res.headers.get('content-type') ?? 'image/jpeg';
  return `data:${mime};base64,${buf.toString('base64')}`;
}

export async function GET(_req: NextRequest, { params }: { params: { profileId: string } }) {
  const userId = getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const profile = await getProfileForUser(params.profileId, userId);
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  if (!profile.is_unlocked) {
    return NextResponse.json({ error: 'This report is locked. Complete payment to unlock it.' }, { status: 403 });
  }

  const { data: analysisRow } = await supabaseAdmin
    .from('skin_analyses')
    .select('insights_json')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const insights: string[] = (analysisRow?.insights_json as string[]) ?? [];

  const { data: recRows } = await supabaseAdmin
    .from('product_recommendations')
    .select(
      'id, product_id, skin_type, recommendation_type, rank, reason, products(id, name, slug, description, category, benefits, usage, warnings, active, product_images(image_url, display_order))'
    )
    .eq('skin_type', profile.skin_type ?? 'normal')
    .order('rank', { ascending: true });

  type Row = {
    id: string;
    product_id: string;
    skin_type: string;
    recommendation_type: 'best' | 'avoid';
    rank: number;
    reason: string;
    products: {
      id: string;
      name: string;
      slug: string;
      description: string;
      category: string;
      benefits: string[];
      usage: string;
      warnings: string;
      active: boolean;
      product_images: { image_url: string; display_order: number }[];
    } | null;
  };

  const toRecommendation = (row: Row): ProductRecommendation | null => {
    if (!row.products) return null;
    const sortedImages = [...row.products.product_images].sort((a, b) => a.display_order - b.display_order);
    return {
      id: row.id,
      product_id: row.product_id,
      skin_type: row.skin_type as ProductRecommendation['skin_type'],
      recommendation_type: row.recommendation_type,
      rank: row.rank,
      reason: row.reason,
      product: {
        id: row.products.id,
        name: row.products.name,
        slug: row.products.slug,
        description: row.products.description,
        category: row.products.category,
        benefits: row.products.benefits,
        usage: row.products.usage,
        warnings: row.products.warnings,
        active: row.products.active,
        images: sortedImages,
      },
    };
  };

  const rows = ((recRows as Row[] | null) ?? []).map(toRecommendation).filter((r): r is ProductRecommendation => r !== null);
  const best = rows.filter((r) => r.recommendation_type === 'best');
  const avoid = rows.filter((r) => r.recommendation_type === 'avoid');

  const profileImageDataUri = profile.image_url ? await urlToDataUri(profile.image_url) : null;

  const withDataUriImage = async (r: ProductRecommendation): Promise<ProductRecommendation> => {
    const first = r.product.images[0];
    if (!first) return r;
    // Product photos are in the PUBLIC product-images bucket per
    // zadoc_storage_policies.sql, but @react-pdf/renderer needs an embeddable
    // data URI rather than a remote URL — fetch and inline it.
    const dataUri = first.image_url.startsWith('data:') ? first.image_url : await urlToDataUri(first.image_url);
    return { ...r, product: { ...r.product, images: [{ ...first, image_url: dataUri }] } };
  };

  const bestWithData = await Promise.all(best.map(withDataUriImage));
  const avoidWithData = await Promise.all(avoid.map(withDataUriImage));

  const logoDataUri = fileToDataUri('logo/zadoc-logo.jpeg');

  const buffer = await renderToBuffer(
    React.createElement(ReportDocument, {
      profile: { ...profile, image_url: profileImageDataUri },
      insights,
      best: bestWithData,
      avoid: avoidWithData,
      logoDataUri,
    }) as unknown as React.ReactElement<DocumentProps>
  );

  return new NextResponse(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="zadoc-report-${profile.name.toLowerCase()}.pdf"`,
      'Cache-Control': 'no-store',
    },
  });
}
