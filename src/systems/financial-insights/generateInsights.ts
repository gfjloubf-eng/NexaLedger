import type { FinancialInsight, InsightsInput } from './insightTypes';
import type { Transaction } from './transactionCompat';

const DEFAULT_NOW = () => new Date();

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function safeFinite(n: unknown): number {
  return typeof n === 'number' && Number.isFinite(n) ? n : 0;
}

function parseCreatedAt(created_at?: string): Date | null {
  if (!created_at) return null;
  const d = new Date(created_at);
  return Number.isFinite(d.getTime()) ? d : null;
}

function startOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // Monday as start
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - day);
  return date;
}

function isSameWeek(d: Date, anchor: Date): boolean {
  return startOfWeek(d).getTime() === startOfWeek(anchor).getTime();
}

function prevWeekRange(anchor: Date): { start: Date; end: Date } {
  const start = startOfWeek(anchor);
  const prevStart = new Date(start);
  prevStart.setDate(prevStart.getDate() - 7);
  const end = new Date(start);
  end.setDate(end.getDate());

  const prevEnd = new Date(prevStart);
  prevEnd.setDate(prevStart.getDate() + 7);
  return { start: prevStart, end: prevEnd };
}

function nextWeekRange(anchor: Date): { start: Date; end: Date } {
  const start = startOfWeek(anchor);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return { start, end };
}

function withinRange(d: Date, start: Date, end: Date): boolean {
  const t = d.getTime();
  return t >= start.getTime() && t < end.getTime();
}

function dayNameAr(dayIndex: number): string {
  const names = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  return names[clamp(dayIndex, 0, 6)] ?? '—';
}

function groupTotalsByCategory(transactions: Transaction[]): Array<{ category: string; total: number }> {
  const map = new Map<string, number>();
  for (const tx of transactions) {
    if (tx.type !== 'expense') continue;
    const category = (tx.category ?? 'عام').toString();
    map.set(category, (map.get(category) ?? 0) + safeFinite(tx.amount));
  }
  return Array.from(map.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

function countAndTotals(transactions: Transaction[]): {
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
    const amount = safeFinite(tx.amount);
    if (tx.type === 'income') {
      incomeTotal += amount;
      incomeCount += 1;
    } else {
      expenseTotal += amount;
      expenseCount += 1;
    }
  }

  return { incomeTotal, expenseTotal, expenseCount, incomeCount };
}

function mostRecentDate(transactions: Transaction[]): Date | null {
  let latest: Date | null = null;
  for (const tx of transactions) {
    const d = parseCreatedAt(tx.created_at);
    if (!d) continue;
    if (!latest || d.getTime() > latest.getTime()) latest = d;
  }
  return latest;
}

function daysBetween(a: Date, b: Date): number {
  const ms = Math.abs(b.getTime() - a.getTime());
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function generateInsights({ transactions, now = DEFAULT_NOW() }: InsightsInput): FinancialInsight[] {
  if (!Array.isArray(transactions) || transactions.length === 0) return [];

  const insights: FinancialInsight[] = [];

  const withDates = transactions
    .map((tx) => ({ tx, date: parseCreatedAt(tx.created_at) }))
    .filter((x) => x.date) as Array<{ tx: Transaction; date: Date }>;

  // 1) Category calm awareness
  const topExpenseCats = groupTotalsByCategory(transactions);
  if (topExpenseCats[0] && topExpenseCats[0].total > 0) {
    const top = topExpenseCats[0];
    insights.push({
      id: 'top_expense_category',
      priority: 1,
      message: `أكثر فئة إنفاق: ${top.category}`,
      meta: { category: top.category, total: top.total },
    });
  }

  // 2) Food rhythm (optional, lightweight)
  const foodCategories = ['طعام'];
  if (withDates.length > 0) {
    const thisWeek = nextWeekRange(now);
    const prevWeek = prevWeekRange(now);

    const foodThisWeek = withDates
      .filter(({ tx, date }) => withinRange(date, thisWeek.start, thisWeek.end) && tx.type === 'expense')
      .filter(({ tx }) => foodCategories.includes((tx.category ?? 'عام') as string))
      .reduce((sum, { tx }) => sum + safeFinite(tx.amount), 0);

    const foodPrevWeek = withDates
      .filter(({ tx, date }) => withinRange(date, prevWeek.start, prevWeek.end) && tx.type === 'expense')
      .filter(({ tx }) => foodCategories.includes((tx.category ?? 'عام') as string))
      .reduce((sum, { tx }) => sum + safeFinite(tx.amount), 0);

    if (foodPrevWeek > 0) {
      const ratio = foodThisWeek / foodPrevWeek;
      if (ratio >= 1.08) {
        insights.push({
          id: 'food_week_up',
          priority: 2,
          message: 'مصروفات الطعام ارتفعت هذا الأسبوع بهدوء.',
          meta: { ratio, foodThisWeek, foodPrevWeek },
        });
      } else if (ratio <= 0.92) {
        insights.push({
          id: 'food_week_down',
          priority: 2,
          message: 'مصروفات الطعام انخفضت هذا الأسبوع بصورة مريحة.',
          meta: { ratio, foodThisWeek, foodPrevWeek },
        });
      }
    }

    // least spending day (calm, non-dramatic)
    const thisWeekTx = withDates.filter(({ date }) => isSameWeek(date, now));
    if (thisWeekTx.length > 0) {
      const byDay = new Map<number, number>();
      for (const { tx, date } of thisWeekTx) {
        if (tx.type !== 'expense') continue;
        byDay.set(date.getDay(), (byDay.get(date.getDay()) ?? 0) + safeFinite(tx.amount));
      }
      const entries = Array.from(byDay.entries());
      if (entries.length > 0) {
        entries.sort((a, b) => a[1] - b[1]);
        const [leastDayIndex, leastTotal] = entries[0];
        insights.push({
          id: 'least_spending_day',
          priority: 3,
          message: `أقل يوم إنفاق هذا الأسبوع: ${dayNameAr(leastDayIndex)}`,
          meta: { day: leastDayIndex, total: leastTotal },
        });
      }
    }
  }

  // 3) Inactivity awareness
  const latest = mostRecentDate(transactions);
  if (latest) {
    const deltaDays = daysBetween(latest, now);
    if (deltaDays >= 7) {
      insights.push({
        id: 'inactivity_seven_days',
        priority: 2,
        message: 'لم تُسجَّل معاملات منذ عدة أيام—عندما تكون جاهزًا، أضف عملية واحدة فقط.',
        meta: { deltaDays, latest: latest.toISOString() },
      });
    }
  }

  // 4) Gentle stability vs expenses
  const totals = countAndTotals(transactions);
  if (totals.expenseTotal > totals.incomeTotal && totals.incomeTotal > 0) {
    insights.push({
      id: 'expenses_higher_than_income',
      priority: 4,
      message: 'المصروفات أعلى من الدخل—فكر في خطوة صغيرة لتحسين التوازن.',
      meta: totals,
    });
  }

  return insights.sort((a, b) => a.priority - b.priority).slice(0, 4);
}

