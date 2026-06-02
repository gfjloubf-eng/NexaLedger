import type { Customer } from '../../types/customer';
import type { Invoice } from '../../types/invoice';
import type { Payment } from '../../types/payment';

export type StatementTimelineItem =
  | {
      kind: 'invoice';
      id: string;
      customerId: string;
      invoiceId: string;
      createdAt: number;
      invoiceNumber: string;
      amount: number;
      overdue: boolean;
    }
  | {
      kind: 'payment';
      id: string;
      customerId: string;
      paymentId: string;
      createdAt: number;
      invoiceId?: string;
      amount: number;
    };

export type CustomerStatementTotals = {
  totalInvoices: number;
  totalPayments: number;
  outstandingBalance: number;
};

export type CustomerStatement = {
  customer: Customer;
  totals: CustomerStatementTotals;
  latestActivity: StatementTimelineItem | null;
  timeline: StatementTimelineItem[];
};

export type BuildStatementsInput = {
  customers: Customer[];
  invoices: Invoice[];
  payments: Payment[];
  nowMs?: number;
};

