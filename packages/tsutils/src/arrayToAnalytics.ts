interface Analytic {
  dataElement: string;
  organisationUnit: string;
  period: string; // should be in format YYYYMMDD e.g. "20210103"
  value: string | number;
}

export type ArrayAnalytic = [string, string, string, string | number];

export const arrayToAnalytics = (arrayAnalytics: ArrayAnalytic[]): Analytic[] =>
  arrayAnalytics.map(([dataElement, organisationUnit, period, value]) => ({
    dataElement,
    organisationUnit,
    period,
    value,
  }));
