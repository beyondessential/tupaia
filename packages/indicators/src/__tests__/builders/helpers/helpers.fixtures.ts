/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { AnalyticResponseFixture } from '../stubs';

export const ANALYTIC_RESPONSE_CONFIG: Record<string, AnalyticResponseFixture> = {
  BCD01: {
    code: 'BCD01',
    aggregations: [{ type: 'FINAL_EACH_WEEK' }],
    analytic: { dataElement: 'BCD01', organisationUnit: 'TO', period: '20200101', value: 1 },
  },
  BCD02: {
    code: 'BCD02',
    aggregations: [{ type: 'FINAL_EACH_WEEK' }, { type: 'SUM' }],
    analytic: { dataElement: 'BCD01', organisationUnit: 'TO', period: '20200101', value: 2 },
  },
  BCD03: {
    code: 'BCD03',
    aggregations: [{ type: 'FINAL_EACH_WEEK' }, { type: 'SUM' }],
    analytic: { dataElement: 'BCD01', organisationUnit: 'TO', period: '20200101', value: 3 },
  },
  BCD04: {
    code: 'BCD04',
    aggregations: [{ type: 'SUM' }, { type: 'FINAL_EACH_WEEK' }],
    analytic: { dataElement: 'BCD01', organisationUnit: 'TO', period: '20200101', value: 4 },
  },
};
