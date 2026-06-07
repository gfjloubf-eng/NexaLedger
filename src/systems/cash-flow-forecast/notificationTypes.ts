import type { CashHealth } from './forecastTypes';

export type NotificationSeverity = 'info' | 'warning' | 'critical';

export type FinancialNotification = {
  severity: NotificationSeverity;
  titleAr: string;
  messageAr: string;
};

export type FinancialForecastNotifications = {
  cashHealth: CashHealth;
  notifications: FinancialNotification[];
};

