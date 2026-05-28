/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from 'react';


import type { ParsedTransaction } from '../types/transaction';

import type { TransactionContextValue } from './transactionContext.types';

import { buildTransactionContextValue, formatSupabaseTransactionRow, type TransactionRow } from './transactionHelpers';
import { supabase } from '../lib/supabase';

import type { PendingSyncPayload } from '../lib/localPersistence';

import { AuthContext } from './authContext';

import {
  localLoadTransactions,
  localSetHydrationMarker,
  localUpsertTransaction,
  localDeleteTransaction,
  localEnqueuePendingCreate,
  localLoadPendingSync,

  localMarkPendingSyncStatus,
} from '../lib/localPersistence';









export const TransactionContext =
  createContext<TransactionContextValue | null>(null);

export function TransactionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Access auth context for persistence (user id required by RLS)
  const authCtx = useContext(AuthContext);
  const currentUser = authCtx?.user ?? null;
  const authLoading = authCtx?.loading ?? false;

  const syncInProgressRef = React.useRef(false);
  const syncStartedAtRef = React.useRef<number | null>(null);


  // Seed transactions from Supabase once auth is ready
  useEffect(() => {
    let mounted = true;

    if (authLoading) {
      return () => {
        mounted = false;
      };
    }

    if (!currentUser) {
      queueMicrotask(() => {
        if (!mounted) return;
        setTransactions([]);
        setLoading(false);
      });

      return () => {
        mounted = false;
      };
    }

    (async () => {
      // Offline-first hydration to prevent flicker/empty screens.
      if (!mounted) return;
      setLoading(true);

      try {
        // 1) Hydrate from Dexie immediately (offline safe)
        const localRows = await localLoadTransactions(currentUser.id);
        if (mounted) {
          setTransactions(
            localRows.map((r) => ({
              id: r.id,
              title: (r.title ?? r.description ?? 'المعاملات') as string,
              amount: Number(r.amount),
              type: r.type,
              category: (r.category ?? 'عام') as string,
            }))
          );
        }

        // 2) Then attempt Supabase sync (online + auth)
        const { data, error } = await supabase
          .from('transactions')
          .select('id,description,amount,transaction_type,category,created_at')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (!error && data && mounted) {
          const fetched = (data as TransactionRow[]).map((r) =>
            formatSupabaseTransactionRow(r)
          );

          // Replace local truth with DB truth (but dedupe by id)
          setTransactions((prev) => {
            const existing = new Set(prev.map((p) => p.id));
            const merged = [
              ...fetched.filter((f) => !existing.has(f.id)),
              ...prev.filter((p) => existing.has(p.id)),
            ];
            // Deterministic order: most recent created_at is not available in local map.
            return merged;
          });
        } else if (error) {
          console.error('Failed to load transactions', error);
        }

        if (mounted) {
          await localSetHydrationMarker(currentUser.id, Date.now());
        }
      } catch (error) {
        console.error('Transaction hydration failed (offline/local/supabase)', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [authLoading, currentUser]);

  const drainPendingSyncRef = React.useRef(false);

  const drainPendingSync = useCallback(async () => {
    if (!currentUser) return;
    if (!currentUser) return;
    if (drainPendingSyncRef.current) return;
    drainPendingSyncRef.current = true;
    if (syncInProgressRef.current) return;

    syncInProgressRef.current = true;
    syncStartedAtRef.current = Date.now();

    try {
      // Load queue snapshot deterministically
      const queue = await localLoadPendingSync(currentUser.id);
      // Queue row uses `created_at` (required by schema).
      const sorted = [...queue].sort((a, b) => (a.created_at ?? 0) - (b.created_at ?? 0));



      for (const item of sorted) {
        // Skip items that were removed while we were processing (race-safe)
        const currentQueue = await localLoadPendingSync(currentUser.id);
        const fresh = currentQueue.find((x) => x.id === item.id);
        if (!fresh) continue;

        if (fresh.sync_status === 'success') {
          continue;
        }

        await localMarkPendingSyncStatus({
          id: item.id,
          sync_status: 'in_progress',
          retry_count: fresh.retry_count,
          last_attempt_at: Date.now(),
        });

        try {
          const payload = fresh.payload as PendingSyncPayload;

          if (payload.operation_type === 'create') {
            // Idempotency: the queue row id is deterministic by transaction_id.
            // Remote insert is best-effort; if it fails due to duplicates, mark as success.
            const createPayload = {
              user_id: currentUser.id,
              description: payload.description,
              amount: payload.amount,
              transaction_type: payload.transaction_type,
              category: payload.category,
            };

            const { data, error } = await supabase
              .from('transactions')
              .insert([createPayload])
              .select('id,description,amount,transaction_type,category,created_at')
              .single();

            if (error) {
              // If remote already has it, treat as success to prevent duplicates.
              // (We rely on deterministic local id + unique-by-app semantics; if RLS/DB lacks constraints, this stays best-effort.)
              if (String(error.message || error).toLowerCase().includes('duplicate')) {
                await localMarkPendingSyncStatus({
                  id: item.id,
                  sync_status: 'success',
                });
                continue;
              }
              throw error;
            }

            if (data) {
              const saved = formatSupabaseTransactionRow(data as TransactionRow);
              // Ensure local row authoritative. Keep local authority for ordering/title.
              await localUpsertTransaction({
                id: saved.id,
                user_id: currentUser.id,
                title: saved.title,
                description: saved.title,
                amount: saved.amount,
                type: saved.type,
                category: saved.category,
                createdAtMs: Date.now(),
                source: 'supabase',
              });

              await localMarkPendingSyncStatus({
                id: item.id,
                sync_status: 'success',
              });

              // Removal on success: simplest durable approach is to leave status=success and filter on load.
              // For now, mark success only (no delete helper yet).
            }
          } else if (payload.operation_type === 'delete') {
            const delId = payload.deleted_id;
            await supabase
              .from('transactions')
              .delete()
              .eq('id', delId)
              .eq('user_id', currentUser.id);

            await localMarkPendingSyncStatus({
              id: item.id,
              sync_status: 'success',
            });
          }
        } catch {
          // Increment retry, preserve row
          await localMarkPendingSyncStatus({
            id: item.id,
            sync_status: 'failed',
            retry_count: (fresh.retry_count ?? 0) + 1,
            last_attempt_at: Date.now(),
          });
        }
      }
    } finally {
      syncInProgressRef.current = false;
      syncStartedAtRef.current = null;
    }
  }, [currentUser, localLoadPendingSync, localMarkPendingSyncStatus, localUpsertTransaction]);

  const addTransaction = useCallback<

    TransactionContextValue['addTransaction']
  >(async (transaction) => {
    const user = currentUser;

    const clientId = transaction.id ?? crypto.randomUUID();
    const amount = Number(transaction.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Invalid transaction amount');
    }

    if (!user) {
      // Keep the original behavior: UI-only when unauthenticated.
      setTransactions((prev) => {
        if (prev.some((p) => p.id === clientId)) return prev;
        return [
          ...prev,
          {
            id: clientId,
            title: transaction.title,
            amount,
            type: transaction.type,
            category: transaction.category,
          },
        ];
      });
      throw new Error('Not authenticated');
    }

    const localRow = {
      id: clientId,
      user_id: user.id,
      title: transaction.title,
      description: transaction.title,
      amount,
      type: transaction.type,
      category: transaction.category ?? 'عام',
      created_at: undefined,
      source: 'local' as const,
      createdAtMs: Date.now(),
    };

    // 1) Write transaction locally FIRST
    await localUpsertTransaction(localRow);

    // 2) Enqueue durable pending_create
    await localEnqueuePendingCreate({
      user_id: user.id,
      transaction_id: clientId,
      payload: {
        description: transaction.title,
        amount,
        transaction_type: transaction.type,
        category: transaction.category ?? 'عام',
      },
    });

    // 3) Update React state immediately
    setTransactions((prev) => {
      if (prev.some((p) => p.id === clientId)) return prev;
      return [
        ...prev,
        {
          id: clientId,
          title: transaction.title,
          amount,
          type: transaction.type,
          category: transaction.category ?? 'عام',
        },
      ];
    });
  }, [currentUser]);


  const deleteTransaction = useCallback<
    TransactionContextValue['deleteTransaction']
  >(async (id) => {
    const user = currentUser;

    if (user) {
      // 1) Delete local-first from Dexie
      await localDeleteTransaction(id, user.id);

      // 2) Enqueue durable remote delete so it can be retried after crashes/offline.
      // (Best-effort type-safe enqueue helpers are in localPersistence.)
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      import('../lib/localPersistence').then((m) =>
        m.localEnqueuePendingDelete({
          user_id: user.id,
          transaction_id: id,
          payload: { deleted_id: id },
        })
      );

    }

    // 3) Update React state immediately
    setTransactions((prev) => prev.filter((transaction) => transaction.id !== id));
  }, [currentUser]);


  const value = useMemo(
    () =>
      buildTransactionContextValue({
        transactions,
        addTransaction,
        deleteTransaction,
        loading,
      }),
    [transactions, addTransaction, deleteTransaction, loading]
  );

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);

  if (!context) {
    throw new Error(
      'useTransactions must be used within TransactionProvider'
    );
  }

  return context;
}