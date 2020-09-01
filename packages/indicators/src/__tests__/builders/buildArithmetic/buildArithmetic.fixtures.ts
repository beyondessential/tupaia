/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { AnalyticResponseFixture } from '../stubs';

type ArrayDataElement = [string, string, string, number]; // dataElement, orgUnit, period, value

/**
 * Code format: `valueHint_orgUnits_periods`
 * Eg for `A_ToPg_20192020`:
 * A => value using 1 (B for 2, C for 3 etc)
 * ToPg => defined in orgUnits: TO, PG
 * 20192020 => defined in periods: 2019, 2020
 */
const ARRAY_DATA_ELEMENTS: ArrayDataElement[] = [
  ['A_To_2019', 'TO', '2019', 1],
  ['B_To_2019', 'TO', '2019', 2],
  ['C_To_2019', 'TO', '2019', 3],
  ['D_To_2019', 'TO', '2019', 4],
  ['E_To_2019', 'TO', '2019', 5],

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
];

export const ANALYTIC_RESPONSE_FIXTURES: AnalyticResponseFixture[] = ARRAY_DATA_ELEMENTS.map(
  ([dataElement, organisationUnit, period, value]) => ({
    code: dataElement,
    aggregations: [{ type: 'FINAL_EACH_YEAR' }],
    analytic: { dataElement, organisationUnit, period, value },
  }),
);
