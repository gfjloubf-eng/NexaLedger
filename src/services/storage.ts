const STORAGE_KEY = 'nexaledger_transactions';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
}

export const getTransactions = (): Transaction[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveTransactions = (transactions: Transaction[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error('Failed to save transactions:', error);
  }
};

