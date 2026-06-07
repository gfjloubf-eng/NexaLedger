export type CashFlowInvoice = {
  id: string;
  amountDue: number;
  dueAtMs: number;
  isPaid: boolean;
  // Derived factor in [0..1] that reduces confidence for overdue invoices.
  daysPastDueFactor: number;
};

export type CashFlowCustomer = {
  id: string;
  // Heuristic score in [0..1], where higher means higher risk.
  riskScore: number;
};

export type CashFlowPayment = {
  id: string;
  amount: number;
  paidAtMs: number;
};

export type CashFlowStatement = {
  id: string;
  // Placeholder for future improvements.
  totalDue: number;
};

export type CashFlowForecastInput = {
  nowMs: number;
  customers: CashFlowCustomer[];
  invoices: CashFlowInvoice[];
  payments: CashFlowPayment[];
  statements: CashFlowStatement[];
  outstandingNow: number;
};

