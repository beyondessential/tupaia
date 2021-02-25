/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

type IndicatorEntries = Record<string, Record<string, unknown>>;

export const entriesToArithmeticIndicators = (entries: IndicatorEntries) =>
  Object.entries(entries).map(([code, config]) => {
    const newConfig = { ...config };
    if (config.parameters) {
      newConfig.parameters = entriesToArithmeticIndicators(config.parameters as IndicatorEntries);
    }
    return { code, builder: 'analyticArithmetic', config: newConfig };
  });
