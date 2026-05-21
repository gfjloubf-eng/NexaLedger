import type { Transaction } from './transactionCompat';


export type InsightRuleId = string;

export type FinancialInsight = {
  id: InsightRuleId;
  message: string;
  priority: number; // lower = more important
  meta?: Record<string, unknown>;
};

export type InsightsInput = {
  transactions: Transaction[];
  now?: Date;
};

