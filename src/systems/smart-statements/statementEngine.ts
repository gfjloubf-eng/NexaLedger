
import type { Invoice, InvoiceStatus } from '../../types/invoice';
import type { Payment } from '../../types/payment';

import type {
  BuildStatementsInput,
  CustomerStatement,
  CustomerStatementTotals,
  StatementTimelineItem,
} from './statementTypes';

const toInvoiceOverdue = (invoice: Invoice, nowMs: number): boolean => {
  if (!invoice.dueDate) return false;

  // Overdue if dueDate passed and invoice is not paid.
  return invoice.dueDate < nowMs && invoice.status !== 'paid';
};

const sumAmounts = (rows: Array<{ amount: number }>): number => {
  let sum = 0;
  for (const r of rows) sum += r.amount;
  return sum;
};

const sortDescByCreatedAt = <T extends { createdAt: number }>(a: T, b: T) =>
  b.createdAt - a.createdAt;

export function buildCustomerStatements(input: BuildStatementsInput): CustomerStatement[] {
  const nowMs = input.nowMs ?? Date.now();

  const invoicesByCustomer = new Map<string, Invoice[]>();
  const paymentsByCustomer = new Map<string, Payment[]>();

  for (const inv of input.invoices) {
    const arr = invoicesByCustomer.get(inv.customerId);
    if (arr) arr.push(inv);
    else invoicesByCustomer.set(inv.customerId, [inv]);
  }

  for (const p of input.payments) {
    const arr = paymentsByCustomer.get(p.customerId);
    if (arr) arr.push(p);
    else paymentsByCustomer.set(p.customerId, [p]);
  }

  const statements: CustomerStatement[] = [];

  for (const customer of input.customers) {
    const customerInvoices = invoicesByCustomer.get(customer.id) ?? [];
    const customerPayments = paymentsByCustomer.get(customer.id) ?? [];

    const totalInvoices = sumAmounts(customerInvoices);
    const totalPayments = sumAmounts(customerPayments);

    const outstandingBalance = totalInvoices - totalPayments;

    const timeline: StatementTimelineItem[] = [];

    for (const inv of customerInvoices) {
      timeline.push({
        kind: 'invoice',
        id: `inv:${inv.id}`,
        customerId: customer.id,
        invoiceId: inv.id,
        createdAt: inv.createdAt,
        invoiceNumber: inv.invoiceNumber,
        amount: inv.amount,
        overdue: toInvoiceOverdue(inv, nowMs),
      });
    }

    for (const p of customerPayments) {
      timeline.push({
        kind: 'payment',
        id: `pay:${p.id}`,
        customerId: customer.id,
        paymentId: p.id,
        createdAt: p.createdAt,
        invoiceId: p.invoiceId,
        amount: p.amount,
      });
    }

    timeline.sort(sortDescByCreatedAt);

    const totals: CustomerStatementTotals = {
      totalInvoices,
      totalPayments,
      outstandingBalance,
    };

    statements.push({
      customer: customer,
      totals,
      latestActivity: timeline.length ? timeline[0] : null,
      timeline,
    });
  }

  return statements;
}

// Helpers for display-layer convenience
export function invoiceTimelineAmount(invAmount: number): number {
  return invAmount;
}

export function paymentTimelineAmount(payAmount: number): number {
  return -payAmount;
}

export function isInvoiceOverdue(inv: Invoice, nowMs: number): boolean {
  return toInvoiceOverdue(inv, nowMs);
}

export function invoiceStatusLabel(status: InvoiceStatus): string {
  switch (status) {
    case 'draft':
      return 'مسودة';
    case 'unpaid':
      return 'غير مدفوعة';
    case 'paid':
      return 'مدفوعة';
    default:
      return 'غير معروف';
  }
}

export type { CustomerStatement, CustomerStatementTotals };

