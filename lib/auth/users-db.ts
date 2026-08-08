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
  role: ZadocUser['role'];
  language: ZadocUser['language'];
  created_at: string;
}

function toPublicUser(row: UserRow): ZadocUser {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    role: row.role,
    language: row.language,
    created_at: row.created_at,
  };
}

export async function createUser(params: {
  name: string;
  phone: string; // already normalized, e.g. +2376XXXXXXXX
  pin: string; // plaintext, hashed here only — never persisted or logged as-is
}): Promise<ZadocUser> {
  const pin_hash = await bcrypt.hash(params.pin, SALT_ROUNDS);

  const { data, error } = await supabaseAdmin
    .from('users')
    .insert({ name: params.name, phone: params.phone, pin_hash })
    .select('id, name, phone, role, language, created_at')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to create user');
  }
  return toPublicUser(data as UserRow);
}

export async function findUserByPhone(phone: string): Promise<UserRow | null> {
  const { data } = await supabaseAdmin
    .from('users')
    .select('id, name, phone, pin_hash, role, language, created_at')
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
