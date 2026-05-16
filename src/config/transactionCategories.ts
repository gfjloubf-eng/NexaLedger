export const TRANSACTION_CATEGORIES = [
  'راتب',
  'طعام',
  'مواصلات',
  'تسوق',
  'فواتير',
  'عام',
] as const;

export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number] | (string & {});

export const CATEGORY_ALIASES: Record<string, TransactionCategory> = {
  // Arabic aliases
  'راتب': 'راتب',
  'pay': 'راتب',

  'طعام': 'طعام',
  'اكل': 'طعام',
  'غداء': 'طعام',
  'عشاء': 'طعام',
  'coffee': 'طعام',
  'قهوة': 'طعام',

  'مواصلات': 'مواصلات',
  'transport': 'مواصلات',
  'uber': 'مواصلات',
  'bolt': 'مواصلات',

  'تسوق': 'تسوق',
  'shopping': 'تسوق',

  'فواتير': 'فواتير',
  'bill': 'فواتير',
  'bills': 'فواتير',

  // Default
  'عام': 'عام',
  'other': 'عام',
  'misc': 'عام',
};

