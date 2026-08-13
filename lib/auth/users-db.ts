// ROUTE: lib/auth/users-db.ts
import bcrypt from 'bcryptjs';
import type { ZadocUser } from '@/types/zadoc';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Real Supabase-backed replacement for Piece 2's lib/mock/users.ts.
// Table: public.users (see zadoc_schema.sql). PINs are bcrypt-hashed here,
// server-side only, and the hash is the only thing ever persisted.

const SALT_ROUNDS = 10;

interface UserRow {
  id: string;
  name: string;
  phone: string;
  pin_hash: string;
  language: ZadocUser['language'];
  created_at: string;
  is_admin: boolean;
}

function toPublicUser(row: UserRow): ZadocUser {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    language: row.language,
    created_at: row.created_at,
    isAdmin: row.is_admin === true,
  };
}

export async function createUser(params: {
  name: string;
  phone: string; // already normalized, e.g. +2376XXXXXXXX
  pin: string; // plaintext, hashed here only — never persisted or logged as-is
  referredByCode?: string | null;
}): Promise<ZadocUser> {
  const pin_hash = await bcrypt.hash(params.pin, SALT_ROUNDS);

  const { data, error } = await supabaseAdmin
    .from('users')
    .insert({
      name: params.name,
      phone: params.phone,
      pin_hash,
      referred_by_code: params.referredByCode ?? null,
    })
    .select('id, name, phone, language, created_at, is_admin')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to create user');
  }
  return toPublicUser(data as UserRow);
}

export async function findUserByPhone(phone: string): Promise<UserRow | null> {
  const { data } = await supabaseAdmin
    .from('users')
    .select('id, name, phone, pin_hash, language, created_at, is_admin')
    .eq('phone', phone)
    .is('deleted_at', null)
    .maybeSingle();
  return (data as UserRow) ?? null;
}

export async function verifyUserPin(phone: string, pin: string): Promise<ZadocUser | null> {
  const user = await findUserByPhone(phone);
  if (!user) return null;
  const valid = await bcrypt.compare(pin, user.pin_hash);
  if (!valid) return null;
  return toPublicUser(user);
}

export async function phoneExists(phone: string): Promise<boolean> {
  const user = await findUserByPhone(phone);
  return user !== null;
}