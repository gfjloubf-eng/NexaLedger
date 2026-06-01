import { localDB } from './dexie';
import type { Invoice, InvoiceStatus } from '../types/invoice';

type InvoiceRow = Invoice & { user_id: string };

export type InvoiceCreatePayload = {
  customerId: string;
  invoiceNumber: string;
  amount: number;
  status: InvoiceStatus;
  dueDate?: number;
  notes?: string;
};

export async function loadInvoices(user_id: string): Promise<Invoice[]> {
  const rows = await localDB.invoices.where('user_id').equals(user_id).sortBy('createdAt');
  rows.sort((a, b) => b.createdAt - a.createdAt);
  return rows as unknown as Invoice[];

}

export async function loadInvoice(user_id: string, id: string): Promise<Invoice | null> {
  const row = await localDB.invoices.get(id);
  if (!row) return null;

  const anyRow = row as unknown as { user_id: string };
  if (anyRow.user_id !== user_id) return null;

  return row as unknown as Invoice;
}

export async function saveInvoice(user_id: string, payload: InvoiceCreatePayload): Promise<string> {
  const id = crypto.randomUUID();

  const row: InvoiceRow = {
    id,
    user_id,
    customerId: payload.customerId,
    invoiceNumber: payload.invoiceNumber.trim(),
    amount: Number.isFinite(payload.amount) ? payload.amount : 0,
    status: payload.status,
    notes: payload.notes?.trim() || undefined,
    createdAt: Date.now(),
    dueDate: typeof payload.dueDate === 'number' ? payload.dueDate : undefined,
  };

  await localDB.invoices.put(row as unknown as never);

  return id;
}

export async function updateInvoice(
  user_id: string,
  id: string,
  payload: InvoiceCreatePayload
): Promise<boolean> {
  const existing = await localDB.invoices.get(id);
  if (!existing) return false;

  const anyExisting = existing as unknown as { user_id: string };
  if (anyExisting.user_id !== user_id) return false;

  const next: InvoiceRow = {
    ...(existing as unknown as InvoiceRow),
    customerId: payload.customerId,
    invoiceNumber: payload.invoiceNumber.trim(),
    amount: Number.isFinite(payload.amount) ? payload.amount : 0,
    status: payload.status,
    notes: payload.notes?.trim() || undefined,
    dueDate: typeof payload.dueDate === 'number' ? payload.dueDate : undefined,
  };

  await localDB.invoices.put(next as unknown as never);


  return true;
}

export async function deleteInvoice(user_id: string, id: string): Promise<boolean> {
  const existing = await localDB.invoices.get(id);
  if (!existing) return false;

  const anyExisting = existing as unknown as { user_id: string };
  if (anyExisting.user_id !== user_id) return false;

  await localDB.invoices.delete(id);
  return true;
}

