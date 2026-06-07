export type CashHealth = 'healthy' | 'warning' | 'critical';

export type CollectionConfidence = 'low' | 'medium' | 'high';

export type ForecastHorizonDays = 7 | 30 | 90;

export type CashHealthInsight = {
  bestCollectionPeriodDays: number;
  highestRiskPeriodDays: number;
  expectedCashInflow: number;
  potentialCashShortage: number;
};

export type CashFlowForecastHorizon = {
  horizonDays: ForecastHorizonDays;
  expectedCollections: number;
  expectedOutstandingBalance: number;
  collectionConfidence: CollectionConfidence;
  collectibleInvoicesCount: number;
};

export type CashFlowForecast = {
  horizons: CashFlowForecastHorizon[];
  outstandingNow: number;
  outstandingProjected: number;
  cashHealth: CashHealth;
  insights: CashHealthInsight;
};

