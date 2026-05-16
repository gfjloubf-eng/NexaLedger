import type { ParsedTransaction } from '../types/transaction';

export function matchesTransactionSearch(
  transaction: ParsedTransaction,
  query: string
): boolean {
  const trimmedQuery = query.trim().toLowerCase();
  if (!trimmedQuery) return true;

  const searchParts = trimmedQuery.split(/\s+/);
  const haystack = [
    transaction.title,
    transaction.category,
    transaction.type,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return searchParts.every((part) => haystack.includes(part));
}
