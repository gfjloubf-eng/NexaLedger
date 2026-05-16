/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from 'react';


import type { ParsedTransaction, TransactionType } from '../types/transaction';
import type { TransactionContextValue } from './transactionContext.types';

import { buildTransactionContextValue, formatSupabaseTransactionRow, type TransactionRow } from './transactionHelpers';
import { supabase, SUPABASE_URL } from '../lib/supabase';
import { AuthContext } from './authContext';

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
      setLoading(true);

      try {
        console.log('Fetching transactions from Supabase for user:', currentUser?.id);
        const { data, error } = await supabase
          .from('transactions')
          .select('id,description,amount,transaction_type,category,created_at')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        console.log('Fetch response data:', data);
        console.log('Fetch response error:', error);

        if (!error && data && mounted) {
          const fetched = (data as TransactionRow[]).map((r) =>
            formatSupabaseTransactionRow(r)
          );

          setTransactions((prev) => {
            const existing = new Set(prev.map((p) => p.id));
            const newRows = fetched.filter((f) => !existing.has(f.id));
            return [...newRows, ...prev];
          });
        } else if (error) {
          console.error('Failed to load transactions', error);
        }
      } catch (error) {
        console.error('Transaction load failed', error);
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
    console.log('addTransaction called with:', transaction);

    // optimistic add for immediate UX
    const clientId = transaction.id ?? crypto.randomUUID();
    console.log('Optimistic update: adding transaction with clientId:', clientId);
    setTransactions((prev) => [
      ...prev,
      {
        ...transaction,
        id: clientId,
        amount: Number(transaction.amount),
      },
    ]);

    // persist to Supabase and reconcile with DB truth
    try {
      const user = currentUser;
      console.log('Current authenticated user:', user);
      console.log('User ID:', user?.id);

      if (!user) {
        console.error('No authenticated user at insert time');
        // rollback optimistic add
        console.log('Rolling back optimistic update due to no auth');
        setTransactions((prev) => prev.filter((p) => p.id !== clientId));
        throw new Error('Not authenticated');
      }

      const amount = Number(transaction.amount);
      console.log('Parsed amount:', amount, 'isFinite:', Number.isFinite(amount));
      if (!Number.isFinite(amount)) {
        console.error('Invalid transaction amount:', transaction.amount);
        setTransactions((prev) => prev.filter((p) => p.id !== clientId));
        throw new Error('Invalid transaction amount');
      }

      const payload: {
        user_id: string;
        description: string;
        amount: number;
        transaction_type: TransactionType;
        category: string;
      } = {
        user_id: user.id,
        description: transaction.title,
        amount,
        transaction_type: transaction.type,
        category: transaction.category ?? 'عام',
      };

      console.log('Final insert payload:', payload);
      console.log('Supabase client URL:', SUPABASE_URL);

      console.log('About to send insert request to Supabase');
      const { data, error } = await supabase
        .from('transactions')
        .insert([payload])
        .select('id,description,amount,transaction_type,category,created_at')
        .single();

      console.log('Supabase insert response data:', data);
      console.log('Supabase insert response error:', error);

      if (error) {
        console.error('Transaction insert failed - exact error:', error);
        console.error('Payload that failed:', payload);
        console.error('Auth session state:', { user, session: authCtx?.session });
        console.log('Rolling back optimistic update due to insert error');
        setTransactions((prev) => prev.filter((p) => p.id !== clientId));
        throw error;
      }

      if (!data) {
        const fallbackError = new Error('Supabase returned no transaction data');
        console.error(fallbackError.message, 'Payload:', payload);
        console.log('Rolling back optimistic update due to no data');
        setTransactions((prev) => prev.filter((p) => p.id !== clientId));
        throw fallbackError;
      }

      console.log('Returned inserted row:', data);
      const saved = formatSupabaseTransactionRow(data as TransactionRow);
      console.log('Formatted saved transaction:', saved);
      setTransactions((prev) => prev.map((p) => (p.id === clientId ? saved : p)));
    } catch (err) {
      console.error('addTransaction caught error:', err);
      throw err;
    }
  }, [currentUser, authCtx]);

  const deleteTransaction = useCallback<
    TransactionContextValue['deleteTransaction']
  >(async (id) => {
    setTransactions((prev) =>
      prev.filter((transaction) => transaction.id !== id)
    );
  }, []);

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