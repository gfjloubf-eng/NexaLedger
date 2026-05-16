  type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category?: string;
  created_at?: string;
};
  

  import type {
  TransactionCategory,
} from '../types/transaction';
export type InsightRuleId = string;

export type FinancialInsight = {
  id: InsightRuleId;
  message: string;
  priority: number;
  meta?: Record<string, unknown>;
};

export type InsightsInput = {
  transactions: Transaction[];
  now?: Date;
};

const DEFAULT_NOW = () => new Date();

function clamp(
  n: number,
  min: number,
  max: number
): number {
  return Math.max(min, Math.min(max, n));
}

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

function isSameWeek(
  d: Date,
  anchor: Date
): boolean {
  const startOfWeek = (x: Date) => {
    const date = new Date(x);

    const day =
      (date.getDay() + 6) % 7;

    date.setHours(0, 0, 0, 0);

    date.setDate(
      date.getDate() - day
    );

    return date;
  };

  const a = startOfWeek(anchor);
  const b = startOfWeek(d);

  return a.getTime() === b.getTime();
}

function prevMonthRange(anchor: Date): {
  start: Date;
  end: Date;
} {
  const start = new Date(anchor);

  start.setDate(1);

  start.setHours(0, 0, 0, 0);

  start.setMonth(
    start.getMonth() - 1
  );

  const end = new Date(anchor);

  end.setDate(1);

  end.setHours(0, 0, 0, 0);

  return { start, end };
}

function currentMonthRange(anchor: Date): {
  start: Date;
  end: Date;
} {
  const start = new Date(anchor);

  start.setDate(1);

  start.setHours(0, 0, 0, 0);

  const end = new Date(start);

  end.setMonth(
    end.getMonth() + 1
  );

  return { start, end };
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

function groupTotalsByCategory(
  transactions: Transaction[]
): Array<{
  category: TransactionCategory;
  total: number;
}> {
  const map = new Map<
    string,
    number
  >();

  for (const tx of transactions) {
    if (tx.type !== 'expense')
      continue;

    const category = (tx.category ||
      'عام') as TransactionCategory;

    map.set(
      category,
      (map.get(category) ?? 0) +
        safeFinite(tx.amount)
    );
  }

  return Array.from(map.entries())
    .map(([category, total]) => ({
      category:
        category as TransactionCategory,
      total,
    }))
    .sort((a, b) => b.total - a.total);
}

function dayNameAr(
  dayIndex: number
): string {
  const names = [
    'الأحد',
    'الإثنين',
    'الثلاثاء',
    'الأربعاء',
    'الخميس',
    'الجمعة',
    'السبت',
  ];

  return (
    names[
      clamp(dayIndex, 0, 6)
    ] ?? '—'
  );
}

function summarizeCountAndTotals(
  transactions: Transaction[]
): {
  incomeTotal: number;
  expenseTotal: number;
  expenseCount: number;
  incomeCount: number;
} {
  let incomeTotal = 0;

  let expenseTotal = 0;

  let expenseCount = 0;

  let incomeCount = 0;

  for (const tx of transactions) {
    const amount = safeFinite(
      tx.amount
    );

    if (tx.type === 'income') {
      incomeTotal += amount;
      incomeCount += 1;
    } else {
      expenseTotal += amount;
      expenseCount += 1;
    }
  }

  return {
    incomeTotal,
    expenseTotal,
    expenseCount,
    incomeCount,
  };
}

export function generateFinancialInsights({
  transactions,
  now = DEFAULT_NOW(),
}: InsightsInput): FinancialInsight[] {
  if (
    !Array.isArray(
      transactions
    ) ||
    transactions.length === 0
  ) {
    return [];
  }

  const withDates = transactions
    .map((tx) => ({
      tx,
      date: parseCreatedAt(
        tx.created_at
      ),
    }))
    .filter((x) => x.date);

  const insights: FinancialInsight[] =
    [];

  const topExpenseCats =
    groupTotalsByCategory(
      transactions
    );

  if (
    topExpenseCats[0] &&
    topExpenseCats[0].total > 0
  ) {
    const top =
      topExpenseCats[0];

    insights.push({
      id: 'top_expense_category',
      priority: 1,
      message: `أكثر فئة صرف: ${String(
        top.category
      )}`,
      meta: {
        category: top.category,
        total: top.total,
      },
    });
  }

  const foodCategoryCandidates: TransactionCategory[] =
    ['طعام'];

  const hasDateData =
    withDates.length > 0;

  if (hasDateData) {
    const anchor = now;

    const weekStart = (() => {
      const d = new Date(anchor);

      const day =
        (d.getDay() + 6) % 7;

      d.setHours(0, 0, 0, 0);

      d.setDate(
        d.getDate() - day
      );

      return d;
    })();

    const weekEnd = new Date(
      weekStart
    );

    weekEnd.setDate(
      weekEnd.getDate() + 7
    );

    const prevWeekStart =
      new Date(weekStart);

    prevWeekStart.setDate(
      prevWeekStart.getDate() -
        7
    );

    const prevWeekEnd =
      new Date(weekEnd);

    prevWeekEnd.setDate(
      prevWeekEnd.getDate() -
        7
    );

    const foodThisWeek =
      withDates
        .filter(
          ({ tx, date }) =>
            date &&
            withinRange(
              date,
              weekStart,
              weekEnd
            ) &&
            tx.type ===
              'expense' &&
            foodCategoryCandidates.includes(
              tx.category as TransactionCategory
            )
        )
        .reduce(
          (sum, { tx }) =>
            sum +
            safeFinite(
              tx.amount
            ),
          0
        );

    const foodPrevWeek =
      withDates
        .filter(
          ({ tx, date }) =>
            date &&
            withinRange(
              date,
              prevWeekStart,
              prevWeekEnd
            ) &&
            tx.type ===
              'expense' &&
            foodCategoryCandidates.includes(
              tx.category as TransactionCategory
            )
        )
        .reduce(
          (sum, { tx }) =>
            sum +
            safeFinite(
              tx.amount
            ),
          0
        );

    if (foodPrevWeek > 0) {
      const ratio =
        foodThisWeek /
        foodPrevWeek;

      if (ratio >= 1.08) {
        insights.push({
          id: 'food_week_up',
          priority: 2,
          message:
            'مصروفات الطعام ارتفعت هذا الأسبوع',
          meta: {
            foodThisWeek,
            foodPrevWeek,
            ratio,
          },
        });
      }

      if (ratio <= 0.92) {
        insights.push({
          id: 'food_week_down',
          priority: 2,
          message:
            'مصروفات الطعام انخفضت هذا الأسبوع',
          meta: {
            foodThisWeek,
            foodPrevWeek,
            ratio,
          },
        });
      }
    }

    const thisWeekTx =
      withDates.filter(
        ({ date }) =>
          date &&
          isSameWeek(
            date,
            anchor
          )
      );

    if (
      thisWeekTx.length > 0
    ) {
      const dayMap =
        new Map<
          number,
          number
        >();

      for (const {
        tx,
        date,
      } of thisWeekTx) {
        if (!date)
          continue;

        if (
          tx.type !==
          'expense'
        )
          continue;

        const day =
          date.getDay();

        dayMap.set(
          day,
          (dayMap.get(day) ??
            0) +
            safeFinite(
              tx.amount
            )
        );
      }

      const entries =
        Array.from(
          dayMap.entries()
        );

      if (
        entries.length > 0
      ) {
        entries.sort(
          (a, b) =>
            a[1] - b[1]
        );

        const [
          leastDayIndex,
          leastTotal,
        ] = entries[0];

        insights.push({
          id: 'least_spending_day',
          priority: 3,
          message: `أقل صرف لديك كان يوم ${dayNameAr(
            leastDayIndex
          )}`,
          meta: {
            day: leastDayIndex,
            total:
              leastTotal,
          },
        });
      }
    }

    const currentMonth =
      currentMonthRange(
        anchor
      );

    const previousMonth =
      prevMonthRange(
        anchor
      );

    const currentIncome =
      withDates
        .filter(
          ({
            tx,
            date,
          }) =>
            date &&
            withinRange(
              date,
              currentMonth.start,
              currentMonth.end
            ) &&
            tx.type ===
              'income'
        )
        .reduce(
          (
            sum,
            { tx }
          ) =>
            sum +
            safeFinite(
              tx.amount
            ),
          0
        );

    const previousIncome =
      withDates
        .filter(
          ({
            tx,
            date,
          }) =>
            date &&
            withinRange(
              date,
              previousMonth.start,
              previousMonth.end
            ) &&
            tx.type ===
              'income'
        )
        .reduce(
          (
            sum,
            { tx }
          ) =>
            sum +
            safeFinite(
              tx.amount
            ),
          0
        );

    if (
      previousIncome > 0 &&
      currentIncome >
        previousIncome
    ) {
      insights.push({
        id: 'income_growth',
        priority: 2,
        message:
          'الدخل هذا الشهر أعلى من الشهر الماضي',
        meta: {
          currentIncome,
          previousIncome,
        },
      });
    }
  }

  const totals =
    summarizeCountAndTotals(
      transactions
    );

  if (
    totals.expenseTotal >
    totals.incomeTotal
  ) {
    insights.push({
      id: 'expenses_higher_than_income',
      priority: 4,
      message:
        'المصروفات الحالية أعلى من الدخل',
      meta: totals,
    });
  }

  return insights.sort(
    (a, b) =>
      a.priority -
      b.priority
  );
}