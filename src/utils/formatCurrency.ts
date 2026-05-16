export type FormatCurrencyOpts = {
  locale?: string;
  currency?: string;
  maximumFractionDigits?: number;
  showSymbol?: boolean; // default true
};

export function formatCurrency(value: number, opts: FormatCurrencyOpts = {}) {
  const locale = opts.locale ?? (typeof document !== 'undefined' && document.documentElement.lang ? document.documentElement.lang : 'ar-SA');
  const currency = opts.currency ?? 'SAR';
  const maximumFractionDigits = opts.maximumFractionDigits ?? 2;

  try {
    const nf = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits,
    });

    if (opts.showSymbol === false) {
      // remove currency symbol by joining non-currency parts
      const parts = (nf as any).formatToParts(value) as Array<{ type: string; value: string }>;
      return parts.filter((p) => p.type !== 'currency').map((p) => p.value).join('').trim();
    }

    return nf.format(value);
  } catch {
    // Fallback: simple formatting using toLocaleString then append currency abbreviation
    const n = Number.isFinite(value) ? value : 0;
    return `${n.toLocaleString('en-US', { maximumFractionDigits })} ${currency}`;
  }
}
