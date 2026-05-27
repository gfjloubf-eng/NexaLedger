import { localDB } from './dexie';
import type { LocalTx } from './dexie';

// Helper to avoid duplicate keys: Dexie tables use primary keys.
const prefsKey = 'operational_prefs' as const;
const markerKey = 'hydration_marker' as const;

export async function localLoadTransactions(user_id: string): Promise<LocalTx[]> {
  // Hydration is deterministic: order by createdAtMs desc, then id.
  const rows = await localDB.localTx
    .where('user_id')
    .equals(user_id)
    .sortBy('createdAtMs');

  // sortBy is ascending; flip to show latest first.
  rows.sort((a, b) => b.createdAtMs - a.createdAtMs);
  return rows;
}

export async function localUpsertTransaction(row: LocalTx): Promise<void> {
  await localDB.localTx.put(row);
}

export type PendingSyncCreatePayload = {
  description: string;
  amount: number;
  transaction_type: 'income' | 'expense';
  category: string;
};

export type PendingSyncDeletePayload = {
  deleted_id: string;
};

export type PendingSyncPayload =
  | ({ operation_type: 'create' } & PendingSyncCreatePayload)
  | ({ operation_type: 'delete' } & PendingSyncDeletePayload);

export type PendingSyncRow = {
  id: string;
  user_id: string;
  operation_type: 'create' | 'delete';
  transaction_id: string;
  payload: PendingSyncPayload;
  created_at: number;
  retry_count: number;
  sync_status: 'pending' | 'in_progress' | 'success' | 'failed';
  last_attempt_at?: number;
  dedupe_key?: string;
};

export async function localEnqueuePendingCreate(params: {
  user_id: string;
  transaction_id: string;
  payload: PendingSyncCreatePayload;
}): Promise<void> {
  await localDB.pendingSync.put({
    id: `${params.user_id}::create::${params.transaction_id}`,
    user_id: params.user_id,
    operation_type: 'create',
    transaction_id: params.transaction_id,
    payload: {
      operation_type: 'create',
      ...params.payload,
    },
    created_at: Date.now(),
    retry_count: 0,
    sync_status: 'pending',
    dedupe_key: `${params.user_id}::create::${params.transaction_id}`,
  });
}

export async function localEnqueuePendingDelete(params: {
  user_id: string;
  transaction_id: string;
  payload: PendingSyncDeletePayload;
}): Promise<void> {
  await localDB.pendingSync.put({
    id: `${params.user_id}::delete::${params.transaction_id}`,
    user_id: params.user_id,
    operation_type: 'delete',
    transaction_id: params.transaction_id,
    payload: {
      operation_type: 'delete',
      ...params.payload,
    },
    created_at: Date.now(),
    retry_count: 0,
    sync_status: 'pending',
    dedupe_key: `${params.user_id}::delete::${params.transaction_id}`,
  });
}

export async function localLoadPendingSync(user_id: string): Promise<PendingSyncRow[]> {
  return localDB.pendingSync.where('user_id').equals(user_id).toArray() as unknown as PendingSyncRow[];
}


export async function localMarkPendingSyncStatus(params: {
  id: string;
  sync_status: PendingSyncRow['sync_status'];
  retry_count?: number;
  last_attempt_at?: number;
}): Promise<void> {
  const row = await localDB.pendingSync.get(params.id);
  if (!row) return;
  await localDB.pendingSync.put({
    ...row,
    sync_status: params.sync_status,
    retry_count:
      typeof params.retry_count === 'number' ? params.retry_count : row.retry_count,
    last_attempt_at:
      typeof params.last_attempt_at === 'number' ? params.last_attempt_at : row.last_attempt_at,
  });
}


export async function localDeleteTransaction(id: string, user_id: string): Promise<void> {
  // delete by id + user_id guard
  const existing = await localDB.localTx.get(id);
  if (existing?.user_id === user_id) {
    await localDB.localTx.delete(id);
  }
}

export async function localLoadHydrationMarker(user_id: string): Promise<number | null> {
  const marker = await localDB.hydrationMarker.get(markerKey as unknown as string);

  if (!marker) return null;
  if (marker.user_id !== user_id) return null;
  return marker.hydratedAtMs;
}

export async function localSetHydrationMarker(user_id: string, hydratedAtMs: number, lastSupabaseSyncAtMs?: number): Promise<void> {
  await localDB.hydrationMarker.put({
    user_id,
    key: markerKey,
    hydratedAtMs,
    lastSupabaseSyncAtMs,
  });
}

export async function localLoadOperationalPrefs(user_id: string): Promise<Record<string, unknown> | null> {
  const prefs = await localDB.operationalPrefs.get(prefsKey as unknown as string);
  if (!prefs) return null;
  if (prefs.user_id !== user_id) return null;
  return prefs.value as Record<string, unknown>;
}

export async function localUpsertOperationalPrefs(user_id: string, value: Record<string, unknown>): Promise<void> {
  await localDB.operationalPrefs.put({
    user_id,
    key: prefsKey,
    value,
    updatedAtMs: Date.now(),
  });
}

export async function localLoadCategories(user_id: string): Promise<string[]> {
  const rows = await localDB.categories.where('user_id').equals(user_id).toArray();
  return rows.map((r) => r.category);
}

export async function localUpsertCategory(user_id: string, category: string): Promise<void> {
  const key = `${user_id}::${category}`;
  // Dexie primary key for categories is not explicitly declared, so use put on composite key.
  await localDB.categories.put({
    user_id,
    category,
    updatedAtMs: Date.now(),
    // Note: Dexie primary key is auto-managed for categories table.
    id: key,

  } as unknown as never);

}

