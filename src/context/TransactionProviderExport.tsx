/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { ParsedTransaction } from '../types/transaction';
import type { TransactionContextValue } from './transactionContext.types';

import {
  buildTransactionContextValue,
  formatSupabaseTransactionRow,
  type TransactionRow,
} from './transactionHelpers';

import { supabase } from '../lib/supabase';
import { AuthContext } from './authContext';

import {
  localLoadTransactions,
  localSetHydrationMarker,
  localUpsertTransaction,
  localDeleteTransaction,
  localEnqueuePendingCreate,
  localEnqueuePendingDelete,
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

  // Seed transactions from Supabase once auth is ready
  useEffect(() => {
    let mounted = true;

    if (authLoading) {
      return () => {
        mounted = false;
      };
    }

    if (!currentUser) {
      mounted = false;
      return () => {
        mounted = false;
      };
    }



    (async () => {
      // Offline-first hydration to prevent flicker/empty screens.
      setLoading(true);

      try {
        // 1) Hydrate from Dexie immediately (offline safe)
        const localRows = await localLoadTransactions(currentUser.id);

        if (!mounted) return;

        const localValidCreatedAtMsCount = localRows.filter(
          (r) => typeof r.createdAtMs === 'number' && Number.isFinite(r.createdAtMs)
        ).length;

        console.log('[TransactionProviderExport][hydration] localRows.length=', localRows.length);
        console.log('[TransactionProviderExport][hydration] localValidCreatedAtMsCount=', localValidCreatedAtMsCount);

        const localSample = localRows[0];
        if (localSample) {
          console.log('[TransactionProviderExport][hydration] localSample=', {
            id: localSample.id,
            createdAtMs: localSample.createdAtMs,
          });
        }

        const hydratedLocalTxs: ParsedTransaction[] = localRows.map((r) => ({
          id: r.id,
          title: (r.title ?? r.description ?? 'معاملات') as string,
          amount: Number(r.amount),
          type: r.type,
          category: (r.category ?? 'عام') as string,
          createdAtMs: r.createdAtMs,
        }));

        console.log('[TransactionProviderExport][hydration] setTransactions(local) -> count=', hydratedLocalTxs.length);
        const hydratedLocalValidCreatedAtMsCount = hydratedLocalTxs.filter(
          (t) => typeof t.createdAtMs === 'number' && Number.isFinite(t.createdAtMs)
        ).length;
        console.log('[TransactionProviderExport][hydration] setTransactions(local) valid createdAtMs count=', hydratedLocalValidCreatedAtMsCount);

        setTransactions(hydratedLocalTxs);



        // 2) Then attempt Supabase sync (online + auth)
        const { data, error } = await supabase
          .from('transactions')
          .select(
            'id,description,amount,transaction_type,category,created_at'
          )
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (!mounted) return;

        if (!error && data) {
          const fetched = (data as TransactionRow[]).map((r) =>
            formatSupabaseTransactionRow(r)
          );

          const fetchedValidCreatedAtMsCount = fetched.filter(
            (t) => typeof t.createdAtMs === 'number' && Number.isFinite(t.createdAtMs)
          ).length;

          console.log('[TransactionProviderExport][merge] fetched.length=', fetched.length);
          console.log(
            '[TransactionProviderExport][merge] fetchedValidCreatedAtMsCount=',
            fetchedValidCreatedAtMsCount
          );

          const fetchedSample = fetched[0];
          if (fetchedSample) {
            console.log('[TransactionProviderExport][merge] fetchedSample=', {
              id: fetchedSample.id,
              createdAtMs: fetchedSample.createdAtMs,
            });
          }

          // Replace local truth with DB truth (but dedupe by id)
          setTransactions((prev) => {
            const existing = new Set(prev.map((p) => p.id));
            const prevById = new Map(prev.map((p) => [p.id, p] as const));

            console.log('[TransactionProviderExport][merge] prev.count=', prev.length);
            const prevValidCreatedAtMsCount = prev.filter(
              (p) => typeof p.createdAtMs === 'number' && Number.isFinite(p.createdAtMs)
            ).length;
            console.log(
              '[TransactionProviderExport][merge] prevValidCreatedAtMsCount=',
              prevValidCreatedAtMsCount
            );

            // Preserve existing timestamp data if available, otherwise derive from Supabase.
            const merged = [
              ...fetched.map((f) => {
                const p = prevById.get(f.id);
                if (!p) return f;
                return {
                  ...f,
                  // Preserve local timestamp if present, otherwise use Supabase-derived value.
                  createdAtMs:
                    typeof p.createdAtMs === 'number'
                      ? p.createdAtMs
                      : f.createdAtMs,
                };
              }),
              // Preserve any local-only transactions.
              ...prev.filter((p) => !existing.has(p.id)),
            ];

            const mergedValidCreatedAtMsCount = merged.filter(
              (t) => typeof t.createdAtMs === 'number' && Number.isFinite(t.createdAtMs)
            ).length;
            console.log(
              '[TransactionProviderExport][merge] merged.count=',
              merged.length
            );
            console.log(
              '[TransactionProviderExport][merge] mergedValidCreatedAtMsCount=',
              mergedValidCreatedAtMsCount
            );

            // Ensure no duplicates and keep the newest superset order.
            const dedup = new Map<string, ParsedTransaction>();
            for (const t of merged) {
              dedup.set(t.id, t);
            }
            const out = Array.from(dedup.values());
            const outValidCreatedAtMsCount = out.filter(
              (t) => typeof t.createdAtMs === 'number' && Number.isFinite(t.createdAtMs)
            ).length;
            console.log('[TransactionProviderExport][merge] setTransactions(supabase merged) -> out.count=', out.length);
            console.log('[TransactionProviderExport][merge] setTransactions(supabase merged) valid createdAtMs count=', outValidCreatedAtMsCount);

            // Sample tracking
            const outSample = out[0];
            if (outSample) {
              const p = prevById.get(outSample.id);
              console.log('[TransactionProviderExport][merge] outSample=', {
                id: outSample.id,
                createdAtMs: outSample.createdAtMs,
                prevCreatedAtMs: p?.createdAtMs,
              });
            }

            return out;
          });


        } else if (error) {
          console.error('Failed to load transactions', error);
        }

        await localSetHydrationMarker(currentUser.id, Date.now());
      } catch (err) {
        console.error(
          'Transaction hydration failed (offline/local/supabase)',
          err
        );
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

  const addTransaction = useCallback<
    TransactionContextValue['addTransaction']
  >(async (transaction) => {
    const user = currentUser;

    if (!user) {
      throw new Error('Not authenticated');
    }

    const amount = Number(transaction.amount);
    const clientId = crypto.randomUUID();

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
          createdAtMs: Date.now(),
        },
      ];

    });
  }, [currentUser]);

  const deleteTransaction = useCallback<
    TransactionContextValue['deleteTransaction']
  >(async (id) => {
    const user = currentUser;

    // 1) Delete local-first from Dexie
    if (user) {
      await localDeleteTransaction(id, user.id);

      // 2) Enqueue durable remote delete
      await localEnqueuePendingDelete({
        user_id: user.id,
        transaction_id: id,
        payload: { deleted_id: id },
      });
    }

    // 3) Update React state immediately
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, [currentUser]);

  const value = useMemo(() => {
    return buildTransactionContextValue({
      transactions,
      addTransaction,
      deleteTransaction,
      loading,
    });
  }, [transactions, addTransaction, deleteTransaction, loading]);

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);

  if (!context) {
    throw new Error('useTransactions must be used within TransactionProvider');
  }

  return context;
}

