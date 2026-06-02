export type PaymentMethod = 'cash' | 'bank' | 'transfer';

export type Payment = {
  id: string;
  customerId: string;
  invoiceId?: string;
  amount: number;
  method: PaymentMethod;
  notes?: string;
  createdAt: number;
};

