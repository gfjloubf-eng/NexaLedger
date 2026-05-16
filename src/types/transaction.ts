export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'راتب'
  | 'طعام'
  | 'مواصلات'
  | 'تسوق'
  | 'فواتير'
  | 'عام'
  | (string & {});

export type QuickAddInput = string;

export type ParsedTransaction = {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
};


