type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category?: string;
  created_at?: string;
};

export type FinancialInsight = {
  id: string;
  message: string;
  priority: number;
  meta?: Record<string, unknown>;
};

export type InsightsInput = {
  transactions: Transaction[];
  now?: Date;
};

// Centralized regex constants
export const re2NumericToken =
  /(?:^|\s)([\u0660-\u0669\d]+(?:[.,][\u0660-\u0669\d]+)?)/u;

function safeFinite(n: unknown): number {
  return typeof n === 'number' &&
    Number.isFinite(n)
    ? n
    : 0;
}

function parseCreatedAt(
  created_at?: string
): Date | null {
  if (!created_at) return null;

  const d = new Date(created_at);

  return Number.isFinite(d.getTime())
    ? d
    : null;
}

function withinRange(
  d: Date,
  start: Date,
  end: Date
): boolean {
  const t = d.getTime();

  return (
    t >= start.getTime() &&
    t < end.getTime()
  );
}

export function generateFinancialInsights({
  transactions,
  now = new Date(),
}: InsightsInput): FinancialInsight[] {
  if (
    !Array.isArray(
      transactions
    ) ||
    transactions.length === 0
  ) {
    return [];
  }

  const insights: FinancialInsight[] =
    [];

  const currentMonthStart =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

  const nextMonthStart =
    new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1
    );

  const currentMonthTransactions =
    transactions.filter((tx) => {
      const d = parseCreatedAt(
        tx.created_at
      );

      return (
        d &&
        withinRange(
          d,
          currentMonthStart,
          nextMonthStart
        )
      );
    });

  const expenseTotal =
    currentMonthTransactions
      .filter(
        (tx) =>
          tx.type ===
          'expense'
      )
      .reduce(
        (sum, tx) =>
          sum +
          safeFinite(tx.amount),
        0
      );

  const incomeTotal =
    currentMonthTransactions
      .filter(
        (tx) =>
          tx.type ===
          'income'
      )
      .reduce(
        (sum, tx) =>
          sum +
          safeFinite(tx.amount),
        0
      );

  if (
    expenseTotal >
    incomeTotal
  ) {
    insights.push({
      id: 'expenses_warning',
      priority: 1,
      message:
        'المصروفات هذا الشهر أعلى من الدخل',
      meta: {
        expenseTotal,
        incomeTotal,
      },
    });
  }

  const categoryTotals =
    new Map<string, number>();

  for (const tx of transactions) {
    if (
      tx.type !==
      'expense'
    )
      continue;

    const category =
      tx.category || 'عام';

    categoryTotals.set(
      category,
      (categoryTotals.get(
        category
      ) ?? 0) +
        safeFinite(tx.amount)
    );
  }

  const sortedCategories =
    Array.from(
      categoryTotals.entries()
    ).sort(
      (a, b) => b[1] - a[1]
    );

  if (
    sortedCategories.length >
    0
  ) {
    insights.push({
      id: 'top_category',
      priority: 2,
      message: `أكثر فئة صرف: ${sortedCategories[0][0]}`,
      meta: {
        category:
          sortedCategories[0][0],
        total:
          sortedCategories[0][1],
      },
    });
  }

  return insights.sort(
    (a, b) =>
      a.priority -
      b.priority
  );
}
