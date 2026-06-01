export type InvoiceStatus = 'draft' | 'unpaid' | 'paid';

export type Invoice = {
  id: string;
  customerId: string;
  invoiceNumber: string;
  amount: number;
  status: InvoiceStatus;
  notes?: string;
  createdAt: number;
  dueDate?: number;
};

