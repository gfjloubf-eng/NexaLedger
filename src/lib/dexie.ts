import Dexie, { type Table } from 'dexie';

// Keep a single Dexie instance so writes/transactions are restart-safe.
export type LocalTx = {
  // Stable primary key: use client id.
  id: string;
  user_id: string;
  title?: string;
  description?: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  created_at?: string;
  // Idempotency + offline safety
  source: 'local' | 'supabase';
  createdAtMs: number;
};

export type LocalOperationalPrefs = {
  user_id: string;
  // single-row key
  key: 'operational_prefs';
  value: {
    // reserve: future operational preferences
    currency?: string;
  };
  updatedAtMs: number;
};

export type LocalCategory = {
  user_id: string;
  category: string;
  updatedAtMs: number;
};

export type LocalHydrationMarker = {
  user_id: string;
  key: 'hydration_marker';
  // Used to prevent duplicate hydration writes and UI flicker.
  hydratedAtMs: number;
  lastSupabaseSyncAtMs?: number;
};

class NexaLocalDB extends Dexie {
  localTx!: Table<LocalTx, string>;
  operationalPrefs!: Table<LocalOperationalPrefs, string>;
  categories!: Table<LocalCategory, string>;
  hydrationMarker!: Table<LocalHydrationMarker, string>;
  pendingSync!: Table<{
    id: string;
    user_id: string;
    operation_type: 'create' | 'delete';
    transaction_id: string;
    payload: import('./localPersistence').PendingSyncPayload;


    created_at: number;
    retry_count: number;
    sync_status: 'pending' | 'in_progress' | 'success' | 'failed';
    last_attempt_at?: number;
    // optional idempotency token
    dedupe_key?: string;
  }, string>;

  constructor() {
    super('nexa_local_db');

    this.version(1).stores({
      // Compound index via encoded keying strategy.
      // Primary key is id, but we also index user_id via secondary indexes.
      localTx: 'id, user_id, createdAtMs',
      operationalPrefs: '&key, user_id, updatedAtMs',
      categories: 'user_id, category, updatedAtMs',
      hydrationMarker: '&key, user_id, hydratedAtMs',
      pendingSync: 'id, user_id, operation_type, transaction_id, created_at, sync_status, retry_count',
    });
  }
}

export const localDB = new NexaLocalDB();

