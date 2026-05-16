import type { TransactionType, TransactionCategory } from '../types/transaction';

export type ExportTransaction = {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
};

const escapeCell = (value: string | number) => {
  const text = String(value);
  return `"${text.replace(/"/g, '""')}"`;
};

export function transactionsToCsv(
  transactions: ExportTransaction[],
  currency: string,
  locale: string
) {
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const lines = [
    ['المعرف', 'الوصف', 'المبلغ', 'العملة', 'النوع', 'الفئة'],
    ...transactions.map((tx) => [
      tx.id,
      tx.title || '—',
      formatter.format(tx.amount),
      currency,
      tx.type,
      tx.category || 'عام',
    ]),
  ];

  return lines.map((row) => row.map(escapeCell).join(',')).join('\r\n');
}

export function exportTransactionsToCsv(
  transactions: ExportTransaction[],
  currency: string,
  locale: string
) {
  const csv = transactionsToCsv(transactions, currency, locale);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.href = url;
  link.setAttribute('download', `nexaledger-transactions-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
