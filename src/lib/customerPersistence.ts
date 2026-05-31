import { localDB } from './dexie';
import type { LocalCustomer } from './dexie';

export type CustomerCreatePayload = {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
};

export async function loadCustomers(user_id: string) {
  const rows = await localDB.customers
    .where('user_id')
    .equals(user_id)
    .sortBy('createdAt');

  return rows;
}

export async function loadCustomer(user_id: string, id: string) {
  const row = await localDB.customers.get(id);
  if (!row) return null;
  if (row.user_id !== user_id) return null;
  return row;
}

export async function saveCustomer(user_id: string, payload: CustomerCreatePayload) {
  const id = crypto.randomUUID();

  const row: LocalCustomer = {
    id,
    user_id,
    name: payload.name.trim(),
    phone: payload.phone.trim(),
    email: payload.email?.trim() || undefined,
    address: payload.address?.trim() || undefined,
    notes: payload.notes?.trim() || undefined,
    createdAt: Date.now(),
  };

  await localDB.customers.put(row);
  return id;
}

export async function updateCustomer(
  user_id: string,
  id: string,
  payload: CustomerCreatePayload
) {
  const existing = await localDB.customers.get(id);
  if (!existing) return false;
  if (existing.user_id !== user_id) return false;

  const next: LocalCustomer = {
    ...existing,
    name: payload.name.trim(),
    phone: payload.phone.trim(),
    email: payload.email?.trim() || undefined,
    address: payload.address?.trim() || undefined,
    notes: payload.notes?.trim() || undefined,
  };

  await localDB.customers.put(next);
  return true;
}

export async function deleteCustomer(user_id: string, id: string) {
  const existing = await localDB.customers.get(id);
  if (!existing) return false;
  if (existing.user_id !== user_id) return false;

  await localDB.customers.delete(id);
  return true;
}

