import type { FinancialForecastNotifications, FinancialNotification } from './notificationTypes';
import type { CashFlowForecast } from './forecastTypes';
import type { CashFlowForecastInput } from './types';

const formatMoneyAr = (n: number) => {
  const v = Math.round(n);
  // Use Arabic digit fallback: simple thousands separator.
  const s = v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${s} د.إ`;
};

const makeNotification = (severity: FinancialNotification['severity'], titleAr: string, messageAr: string): FinancialNotification => {
  return { severity, titleAr, messageAr };
};

export function buildFinancialNotifications(input: {
  forecast: CashFlowForecast;
  cashHealth: CashFlowForecast['cashHealth'];
  invoiceDueOverdueCount: number;
  highRiskCustomerCount: number;
  largeOutstandingBalanceCount: number;
  collectionOpportunityCount: number;
  cashFlowWarningsCount: number;
  // Keep a reference input for future extension.
  rawInput: CashFlowForecastInput;
}): FinancialForecastNotifications {
  const { forecast } = input;

  const notifications: FinancialNotification[] = [];

  if (input.invoiceDueOverdueCount > 0) {
    notifications.push(
      makeNotification(
        input.cashFlowWarningsCount > 3 ? 'critical' : 'warning',
        'تنبيه فواتير متأخرة',
        `لديك ${input.invoiceDueOverdueCount} فاتورة/فواتير متأخرة. راجع حالات التحصيل لتقليل المخاطر.`
      )
    );
  }

  if (input.highRiskCustomerCount > 0) {
    notifications.push(
      makeNotification(
        input.highRiskCustomerCount > 5 ? 'critical' : 'warning',
        'تنبيه عملاء عاليي المخاطر',
        `هناك ${input.highRiskCustomerCount} عميل/عملاء عاليي المخاطر قد يؤثرون على التدفق النقدي.`
      )
    );
  }

  if (input.largeOutstandingBalanceCount > 0) {
    notifications.push(
      makeNotification(
        'warning',
        'تنبيه حجم المبالغ المستحقة',
        `المبالغ المستحقة حالياً قد تصل إلى ${formatMoneyAr(forecast.outstandingNow)}. ركز على الفواتير الأكبر.`
      )
    );
  }

  if (input.collectionOpportunityCount > 0) {
    notifications.push(
      makeNotification(
        'info',
        'فرصة تحصيل قريبة',
        `يوجد ${input.collectionOpportunityCount} فرصة تحصيل ضمن نافذة التوقعات الحالية. قد تحسن التدفق النقدي سريعاً.`
      )
    );
  }

  if (forecast.cashHealth === 'critical') {
    notifications.push(
      makeNotification(
        'critical',
        'تحذير تدفق نقدي',
        'مؤشرات المخاطر تشير لاحتمالية نقص في السيولة ضمن الآجال القادمة. اتخذ إجراءات تحصيل مبكرة.'
      )
    );
  } else if (forecast.cashHealth === 'warning') {
    notifications.push(
      makeNotification(
        'warning',
        'تنبيه تدفق نقدي',
        'التوقعات تُظهر ضغطاً متوسطاً على السيولة. راقب التحصيل وخطط لمرحلة جمع المبالغ.'
      )
    );
  }

  if (notifications.length === 0) {
    notifications.push(
      makeNotification(
        'info',
        'لا توجد تنبيهات حرجة',
        'التوقعات المالية ضمن النطاق المقبول حالياً.'
      )
    );
  }

  return {
    cashHealth: forecast.cashHealth,
    notifications,
  };
}

