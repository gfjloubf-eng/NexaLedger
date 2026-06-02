import { localDB } from './dexie';
import type { Payment, PaymentMethod } from '../types/payment';

// Payment persistence relies on the Dexie table being registered in src/lib/dexie.ts.
type PaymentRow = Payment & { user_id: string };


export type PaymentCreatePayload = {
  customerId: string;
  invoiceId?: string;
  amount: number;
  method: PaymentMethod;
  notes?: string;
};

export async function loadPayments(user_id: string): Promise<Payment[]> {
  const rows = await localDB.payments

    .where('user_id')
    .equals(user_id)
    .sortBy('createdAt');

  (rows as PaymentRow[]).sort((a: PaymentRow, b: PaymentRow) =>
    b.createdAt - a.createdAt
  );
  return rows as unknown as Payment[];
}

export async function loadPayment(
  user_id: string,
  id: string
): Promise<Payment | null> {
  const row = await localDB.payments.get(id);
  if (!row) return null;

  const anyRow = row as unknown as { user_id: string };
  if (anyRow.user_id !== user_id) return null;

  return row as unknown as Payment;
}

export async function savePayment(
  user_id: string,
  payload: PaymentCreatePayload
): Promise<string> {
  const id = crypto.randomUUID();

  const row: PaymentRow = {
    id,
    user_id,
    customerId: payload.customerId,
    invoiceId: payload.invoiceId || undefined,
    amount: Number.isFinite(payload.amount) ? payload.amount : 0,
    method: payload.method,
    notes: payload.notes?.trim() || undefined,
    createdAt: Date.now(),
  };

  await localDB.payments.put(row as unknown as never);

  return id;
}

export async function updatePayment(
  user_id: string,
  id: string,
  payload: PaymentCreatePayload
): Promise<boolean> {
  const existing = await localDB.payments.get(id);
  if (!existing) return false;

  const anyExisting = existing as unknown as { user_id: string };
  if (anyExisting.user_id !== user_id) return false;

  const next: PaymentRow = {
    ...(existing as unknown as PaymentRow),
    customerId: payload.customerId,
    invoiceId: payload.invoiceId || undefined,
    amount: Number.isFinite(payload.amount) ? payload.amount : 0,
    method: payload.method,
    notes: payload.notes?.trim() || undefined,
  };

  await localDB.payments.put(next as unknown as never);
  return true;
}

export async function deletePayment(
  user_id: string,
  id: string
): Promise<boolean> {
  const existing = await localDB.payments.get(id);
  if (!existing) return false;

  const anyExisting = existing as unknown as { user_id: string };
  if (anyExisting.user_id !== user_id) return false;

  await localDB.payments.delete(id);
  return true;
}

