/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

type IndicatorEntries = Record<string, Record<string, unknown>>;

export const entriesToEventCountIndicators = (entries: IndicatorEntries) =>
  Object.entries(entries).map(([code, config]) => {
    const newConfig = { ...config };
    return { code, builder: 'eventCount', config: newConfig };
  });
