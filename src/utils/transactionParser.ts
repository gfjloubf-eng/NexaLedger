import { CATEGORY_ALIASES } from '../config/transactionCategories';

import type {
  ParsedTransaction,
  QuickAddInput,
  TransactionCategory,
  TransactionType,
} from '../types/transaction';

const AR_DIGITS = {
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9',
} as const;

function normalizeArabicDigits(input: string): string {
  // Avoid unicode class issues in some ESLint configs; convert only known Arabic-Indic digits.
  return input.replace(/[٠-٩]/g, (digit) => {
    return AR_DIGITS[digit as keyof typeof AR_DIGITS] ?? digit;
  });
}


function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}

function toNumberSafe(raw: string): number | null {
  const cleaned = raw.replace(/,/g, '.');
  const num = Number(cleaned);

  if (!Number.isFinite(num)) return null;
  if (num <= 0) return null;

  return num;
}

function detectType(text: string): TransactionType {
  const t = text.toLowerCase();

  const incomeSignals = [
    'income',
    'salary',
    'pay',
    'راتب',
    'رواتب',
    'مكافأة',
    'bonus',
  ];

  const expenseSignals = [
    'expense',
    'food',
    'طعام',
    'اكل',
    'مواصلات',
    'تسوق',
    'فواتير',
    'bill',
    'bills',
    'transport',
    'uber',
    'coffee',
    'قهوة',
  ];

  const incomeHit = incomeSignals.some((s) => t.includes(String(s)));
  const expenseHit = expenseSignals.some((s) => t.includes(String(s)));

  if (incomeHit && !expenseHit) return 'income';
  if (expenseHit && !incomeHit) return 'expense';

  if (t.includes('راتب') || t.includes('salary') || t.includes('pay')) {
    return 'income';
  }

  return 'expense';
}

function extractAmount(text: string): {
  amount: number | null;
  cleanedText: string;
} {
  const normalized = normalizeArabicDigits(text);

  const amountRegex =
    /(?:^|\s)((?:[0-9]+|[٠-٩]+)(?:[.,](?:[0-9]+|[٠-٩]+))?)(?=\s|$)/u;

  let amount: number | null = null;
  let cleanedText = normalized;

  const match = normalized.match(amountRegex);

  if (match) {
    const rawAmount = normalizeArabicDigits(match[1]);

    amount = toNumberSafe(rawAmount);

    cleanedText = normalized.replace(match[1], ' ').trim();
  }

  return {
    amount,
    cleanedText,
  };
}

function normalizeCategory(raw: string): TransactionCategory {
  // ESLint-friendly: avoid confusing Unicode combining-character ranges/classes.
  // This removes common Arabic diacritics (tashkeel) explicitly.
  const cleaned = raw
    .toLowerCase()
    .replace(/\u0640|\u064B|\u064C|\u064D|\u064E|\u064F|\u0650|\u0651|\u0652/gu, '')
    .trim();

  const aliased = CATEGORY_ALIASES[cleaned];
  if (aliased) return aliased;

  for (const [key, value] of Object.entries(CATEGORY_ALIASES)) {
    if (cleaned.includes(key.toLowerCase())) {
      return value;
    }
  }

  return 'عام';
}

function titleFromText(
  original: string,
  category: TransactionCategory
): string {
  const withoutDigits = original
    .replace(/[0-9٠-٩]+(?:[.,][0-9٠-٩]+)?/g, ' ')
    .trim();

  const candidate = normalizeWhitespace(withoutDigits);

  return candidate.length > 0 ? candidate : String(category);
}

function parseCategoryAndType(cleanedText: string): {
  category: TransactionCategory;
  type: TransactionType;
} {
  const tokens = cleanedText
    .split(' ')
    .map((x) => x.trim())
    .filter(Boolean);

  let foundCategory: TransactionCategory | null = null;

  for (const token of tokens) {
    const maybe = normalizeCategory(token);

    if (maybe !== 'عام' || token === 'عام') {
      foundCategory = maybe;
      break;
    }
  }

  const category = foundCategory ?? normalizeCategory(cleanedText);

  const type = detectType(`${category} ${cleanedText}`);

  return {
    category,
    type,
  };
}

export function parseQuickAdd(
  input: QuickAddInput
): ParsedTransaction | null {
  const trimmed = normalizeWhitespace(input);
  if (!trimmed) return null;

  const { amount, cleanedText } = extractAmount(trimmed);
  if (!amount) return null;

  const { category, type } = parseCategoryAndType(cleanedText);
  const title = titleFromText(trimmed, category);

  return {
    id: crypto.randomUUID(),
    title,
    amount,
    type,
    category,
  };
}

