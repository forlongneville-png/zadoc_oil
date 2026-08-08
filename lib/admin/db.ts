import { supabaseAdmin } from '@/lib/supabase/admin';
import type { SkinType, RecommendationType, ZadocUser } from '@/types/zadoc';
import type { ProductFormValue } from '@/components/admin/ProductForm';

// Real Supabase-backed replacement for Piece 7's lib/mock/admin.ts.
//
// NOTE — schema gap: Piece 7's standalone AdminProduct type invented two
// fields (`skin_type_compatibility`, `avoid_reason`) that don't exist as
// columns on the real `products` table (zadoc_schema.sql only models that
// relationship via product_recommendations: skin_type + recommendation_type
// per ranking row). We keep the admin UI's contract intact — the form still
// sends/receives these fields — but derive `skin_type_compatibility` from
// this product's actual recommendation rows (read-side only) rather than
// persisting a column that isn't in the schema, and `avoid_reason` doesn't
// round-trip to storage. Real admin fields (name, description, category,
// benefits, usage, warnings, active, images) persist for real.

function slugify(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function getOverview() {
  const [{ count: total_users }, { count: total_profiles }, { count: total_scans }, paymentsRes, earningsRes] =
    await Promise.all([
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).is('deleted_at', null),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('skin_analyses').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('payments').select('user_id, amount').eq('status', 'successful'),
      supabaseAdmin.from('creator_earnings').select('commission_amount'),
    ]);

  const successfulPayments = paymentsRes.data ?? [];
  const paid_customers = new Set(successfulPayments.map((p) => p.user_id)).size;
  const total_revenue_fcfa = successfulPayments.reduce((s, p) => s + Number(p.amount), 0);
  const creator_commissions_fcfa = (earningsRes.data ?? []).reduce((s, e) => s + Number(e.commission_amount), 0);

  return {
    total_users: total_users ?? 0,
    total_profiles: total_profiles ?? 0,
    total_scans: total_scans ?? 0,
    paid_customers,
    total_revenue_fcfa,
    creator_commissions_fcfa,
    net_platform_revenue_fcfa: total_revenue_fcfa - creator_commissions_fcfa,
  };
}

export async function listUsers(): Promise<ZadocUser[]> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, name, phone, role, language, created_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as ZadocUser[]) ?? [];
}

async function skinTypeCompatibilityFor(productId: string): Promise<SkinType[]> {
  const { data } = await supabaseAdmin
    .from('product_recommendations')
    .select('skin_type')
    .eq('product_id', productId);
  return [...new Set((data ?? []).map((r) => r.skin_type as SkinType))];
}

export async function listProducts(): Promise<ProductFormValue[]> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('id, name, slug, description, category, benefits, usage, warnings, active, product_images(image_url, display_order)')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);

  return Promise.all(
    (data ?? []).map(async (p) => ({
      id: p.id,
      name: p.name,
      description: p.description ?? '',
      category: p.category ?? '',
      benefits: (p.benefits as string[]) ?? [],
      usage: p.usage ?? '',
      warnings: p.warnings ?? '',
      avoid_reason: '', // not a real column — see note above
      skin_type_compatibility: await skinTypeCompatibilityFor(p.id),
      active: p.active,
      images: [...((p.product_images as { image_url: string; display_order: number }[]) ?? [])].sort(
        (a, b) => a.display_order - b.display_order
      ),
    }))
  );
}

export async function createProduct(value: ProductFormValue): Promise<ProductFormValue> {
  const { data: product, error } = await supabaseAdmin
    .from('products')
    .insert({
      name: value.name,
      slug: slugify(value.name),
      description: value.description,
      category: value.category,
      benefits: value.benefits,
      usage: value.usage,
      warnings: value.warnings,
      active: value.active,
    })
    .select('id')
    .single();
  if (error || !product) throw new Error(error?.message ?? 'Failed to create product');

  if (value.images.length > 0) {
    await supabaseAdmin
      .from('product_images')
      .insert(value.images.map((img) => ({ product_id: product.id, image_url: img.image_url, display_order: img.display_order })));
  }

  return { ...value, id: product.id, avoid_reason: '', skin_type_compatibility: [] };
}

export async function updateProduct(id: string, patch: Partial<ProductFormValue>): Promise<ProductFormValue> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.description !== undefined) dbPatch.description = patch.description;
  if (patch.category !== undefined) dbPatch.category = patch.category;
  if (patch.benefits !== undefined) dbPatch.benefits = patch.benefits;
  if (patch.usage !== undefined) dbPatch.usage = patch.usage;
  if (patch.warnings !== undefined) dbPatch.warnings = patch.warnings;
  // Soft delete only: setting active=false (never removing the row) preserves
  // historical product-image and recommendation references tied to this product id.
  if (patch.active !== undefined) dbPatch.active = patch.active;

  const { error } = await supabaseAdmin.from('products').update(dbPatch).eq('id', id);
  if (error) throw new Error(error.message);

  if (patch.images) {
    await supabaseAdmin.from('product_images').delete().eq('product_id', id);
    if (patch.images.length > 0) {
      await supabaseAdmin
        .from('product_images')
        .insert(patch.images.map((img) => ({ product_id: id, image_url: img.image_url, display_order: img.display_order })));
    }
  }

  const products = await listProducts();
  const updated = products.find((p) => p.id === id);
  if (!updated) throw new Error('Product not found after update');
  return updated;
}

export async function listRecommendations() {
  const { data, error } = await supabaseAdmin
    .from('product_recommendations')
    .select(
      'id, product_id, skin_type, recommendation_type, rank, reason, products(id, name, slug, description, category, benefits, usage, warnings, active, product_images(image_url, display_order))'
    )
    .order('rank', { ascending: true });
  if (error) throw new Error(error.message);

  return (data ?? [])
    .filter((r) => r.products !== null)
    .map((r) => {
      const product = r.products as unknown as {
        id: string; name: string; slug: string; description: string; category: string;
        benefits: string[]; usage: string; warnings: string; active: boolean;
        product_images: { image_url: string; display_order: number }[];
      };
      return {
        id: r.id,
        product_id: r.product_id,
        skin_type: r.skin_type as SkinType,
        recommendation_type: r.recommendation_type as RecommendationType,
        rank: r.rank,
        reason: r.reason ?? '',
        product: {
          ...product,
          images: [...product.product_images].sort((a, b) => a.display_order - b.display_order),
        },
      };
    });
}

export async function upsertRecommendation(input: {
  id?: string;
  product_id: string;
  skin_type: SkinType;
  recommendation_type: RecommendationType;
  rank: number;
  reason: string;
}) {
  // Enforce unique (skin_type, recommendation_type, rank) — mirrors the
  // client-side check and the DB's own unique constraint.
  const { data: clash } = await supabaseAdmin
    .from('product_recommendations')
    .select('id')
    .eq('skin_type', input.skin_type)
    .eq('recommendation_type', input.recommendation_type)
    .eq('rank', input.rank)
    .neq('id', input.id ?? '00000000-0000-0000-0000-000000000000')
    .maybeSingle();

  if (clash) {
    throw Object.assign(new Error(`Rank ${input.rank} is already taken for ${input.skin_type} / ${input.recommendation_type}.`), {
      status: 409,
    });
  }

  if (input.id) {
    const { error } = await supabaseAdmin
      .from('product_recommendations')
      .update({
        product_id: input.product_id,
        skin_type: input.skin_type,
        recommendation_type: input.recommendation_type,
        rank: input.rank,
        reason: input.reason,
      })
      .eq('id', input.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabaseAdmin.from('product_recommendations').insert({
      product_id: input.product_id,
      skin_type: input.skin_type,
      recommendation_type: input.recommendation_type,
      rank: input.rank,
      reason: input.reason,
    });
    if (error) throw new Error(error.message);
  }

  const all = await listRecommendations();
  return all.find(
    (r) => r.skin_type === input.skin_type && r.recommendation_type === input.recommendation_type && r.rank === input.rank
  );
}

export async function listCreators() {
  const { data: creatorRows, error } = await supabaseAdmin
    .from('creators')
    .select('id, user_id, referral_code, commission_rate, status, users(name)');
  if (error) throw new Error(error.message);

  return Promise.all(
    (creatorRows ?? []).map(async (row) => {
      const creatorId = row.id;
      const [{ count: clicks }, { count: signups }, earningsRes, payoutRes] = await Promise.all([
        supabaseAdmin.from('referral_clicks').select('*', { count: 'exact', head: true }).eq('creator_id', creatorId),
        supabaseAdmin.from('referrals').select('*', { count: 'exact', head: true }).eq('creator_id', creatorId),
        supabaseAdmin.from('creator_earnings').select('commission_amount, status').eq('creator_id', creatorId),
        supabaseAdmin.from('payout_requests').select('amount, status').eq('creator_id', creatorId),
      ]);

      const earnings = earningsRes.data ?? [];
      const paid_users = new Set(earnings.map((e) => e)).size; // distinct paid conversions this creator drove (approximation: one earning per paying user)
      const available = earnings.filter((e) => e.status === 'available').reduce((s, e) => s + Number(e.commission_amount), 0);
      const pending = earnings.filter((e) => e.status === 'pending').reduce((s, e) => s + Number(e.commission_amount), 0);
      const paid = earnings.filter((e) => e.status === 'paid').reduce((s, e) => s + Number(e.commission_amount), 0);
      const total = earnings.reduce((s, e) => s + Number(e.commission_amount), 0);
      const paid_out = (payoutRes.data ?? []).filter((p) => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0);

      return {
        creator: { id: row.id, user_id: row.user_id, referral_code: row.referral_code, commission_rate: Number(row.commission_rate), status: row.status },
        name: (row.users as unknown as { name: string } | null)?.name ?? 'Unknown',
        clicks: clicks ?? 0,
        signups: signups ?? 0,
        paid_users,
        earnings: { available, pending, paid, total },
        paid_out,
      };
    })
  );
}

export async function convertUserToCreator(userId: string, commissionRate: number) {
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('id, name')
    .eq('id', userId)
    .maybeSingle();
  if (userError || !user) throw new Error('User not found');

  const referral_code = `${user.name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'CREATOR'}${Math.floor(Math.random() * 90 + 10)}`;

  const { data: creator, error } = await supabaseAdmin
    .from('creators')
    .insert({ user_id: userId, referral_code, commission_rate: commissionRate, status: 'active' })
    .select('id, user_id, referral_code, commission_rate, status')
    .single();
  if (error || !creator) throw new Error(error?.message ?? 'Failed to convert to creator');

  await supabaseAdmin.from('users').update({ role: 'creator' }).eq('id', userId);

  return {
    creator: { ...creator, commission_rate: Number(creator.commission_rate) },
    name: user.name,
    referral_link: `zadoc.online/?ref=${referral_code}`,
  };
}

export async function updateCreatorCommission(creatorId: string, commissionRate: number) {
  // ACCOUNTING RULE: only updates the creator's forward-looking commission_rate.
  // Past creator_earnings rows already snapshot their own commission_rate at
  // generation time and are never rewritten here.
  const { data, error } = await supabaseAdmin
    .from('creators')
    .update({ commission_rate: commissionRate })
    .eq('id', creatorId)
    .select('id, user_id, referral_code, commission_rate, status')
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Creator not found');
  return { ...data, commission_rate: Number(data.commission_rate) };
}
