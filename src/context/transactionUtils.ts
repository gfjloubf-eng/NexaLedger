export type TransactionCategory =
  | 'راتب'
  | 'طعام'
  | 'مواصلات'
  | 'تسوق'
  | 'فواتير'
  | 'عام'
  | (string & {});

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: TransactionCategory;
}

export const migrateTransactions = (raw: unknown): Transaction[] => {
  if (!Array.isArray(raw)) return [];

  return raw.map((tx) => {
    const record = (tx && typeof tx === 'object' ? (tx as Record<string, unknown>) : {}) as Record<
      string,
      unknown
    >;

    const id = typeof record.id === 'string' ? record.id : String(record.id ?? '');
    const title = typeof record.title === 'string' ? record.title : String(record.title ?? '');
    const amountNum = typeof record.amount === 'number' ? record.amount : Number(record.amount);
    const amount = Number.isFinite(amountNum) ? amountNum : 0;
    const type = record.type === 'income' ? 'income' : 'expense';
    const category = (typeof record.category === 'string' ? record.category : undefined) || 'عام';

    return {
      id: id || crypto.randomUUID(),
      title,
      amount,
      type,
      category,
    };
  });
};

