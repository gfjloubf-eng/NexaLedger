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
      setTransactions([]);
      setLoading(false);
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
        setTransactions(
          localRows.map((r) => ({
            id: r.id,
            title: (r.title ?? r.description ?? 'معاملات') as string,
            amount: Number(r.amount),
            type: r.type,
            category: (r.category ?? 'عام') as string,
          }))
        );

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

          // Replace local truth with DB truth (but dedupe by id)
          setTransactions((prev) => {
            const existing = new Set(prev.map((p) => p.id));
            const merged = [
              ...fetched.filter((f) => !existing.has(f.id)),
              ...prev.filter((p) => existing.has(p.id)),
            ];
            return merged;
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

