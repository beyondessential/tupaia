/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { arrayToAnalytics } from '@tupaia/data-broker';
import { Analytic } from '../../../types';
import { AnalyticResponseFixture } from '../stubs';

/**
 * Code format: `valueHint_orgUnits_periods`
 * Eg for `A_ToPg_20192020`:
 * A => analytic values use 1 (B for 2, C for 3 etc)
 * ToPg => analytics exist for orgUnits: TO, PG
 * 20192020 => analytics exist for periods: 2019, 2020
 */
const AGGREGATOR_ARRAY_ANALYTICS: [string, string, string, number][] = [
  ['Zero', 'TO', '2019', 0],
  ['One', 'TO', '2019', 1],
  ['Two', 'TO', '2019', 2],
  ['Three', 'TO', '2019', 3],
  ['Four', 'TO', '2019', 4],
  ['Five', 'TO', '2019', 5],

  ['A_ToPg_20192020', 'TO', '2019', 1],
  ['A_ToPg_20192020', 'TO', '2020', 10],
  ['A_ToPg_20192020', 'PG', '2019', 1.1],
  ['A_ToPg_20192020', 'PG', '2020', 11],

  ['B_ToPg_20192020', 'TO', '2019', 2],
  ['B_ToPg_20192020', 'TO', '2020', 20],
  ['B_ToPg_20192020', 'PG', '2019', 2.2],
  ['B_ToPg_20192020', 'PG', '2020', 22],

  ['C_ToPg_2019', 'TO', '2019', 3],
  ['C_ToPg_2019', 'PG', '2019', 3.3],

  ['D_To_20192020', 'TO', '2019', 4],
  ['D_To_20192020', 'TO', '2020', 40],

  ['E_Pg_20192020', 'PG', '2019', 5.5],
  ['E_Pg_20192020', 'PG', '2020', 55],

  ['Population', 'TO', '2019', 100],
  ['Population', 'TO', '2020', 75],
];

export const ANALYTIC_RESPONSE_FIXTURES: AnalyticResponseFixture[] = arrayToAnalytics(
  AGGREGATOR_ARRAY_ANALYTICS,
).map((analytic: Analytic) => ({
  code: analytic.dataElement,
  aggregations: [{ type: 'FINAL_EACH_YEAR' }],
  analytic,
}));

export const PARAMETER_ANALYTICS = arrayToAnalytics([
  ['_Positive_Cases', 'TO', '2019', 10],
  ['_Positive_Cases', 'TO', '2020', 15],
  ['_Total_Consultations', 'TO', '2019', 25],
  ['_Total_Consultations', 'TO', '2020', 50],
]) as Analytic[];
