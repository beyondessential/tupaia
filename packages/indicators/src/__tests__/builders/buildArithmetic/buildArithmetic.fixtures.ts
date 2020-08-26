/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { AnalyticResponseFixture } from '../stubs';

type ArrayDataElement = [string, string, string, number]; // dataElement, orgUnit, period, value

const ARRAY_DATA_ELEMENTS: ArrayDataElement[] = [
  ['A_TO_2019', 'TO', '2019', 1],
  ['B_TO_2019', 'TO', '2019', 2],
  ['C_TO_2019', 'TO', '2019', 3],
  ['D_TO_2019', 'TO', '2019', 4],
  ['E_TO_2019', 'TO', '2019', 5],

  ['A_TOPG_201920', 'TO', '2019', 1],
  ['A_TOPG_201920', 'TO', '2020', 10],
  ['A_TOPG_201920', 'PG', '2019', 1.1],
  ['A_TOPG_201920', 'PG', '2020', 11],

  ['B_TOPG_201920', 'TO', '2019', 2],
  ['B_TOPG_201920', 'TO', '2020', 20],
  ['B_TOPG_201920', 'PG', '2019', 2.2],
  ['B_TOPG_201920', 'PG', '2020', 22],

  ['C_TOPG_2019', 'TO', '2019', 3],
  ['C_TOPG_2019', 'PG', '2019', 3.3],

  ['D_TO_201920', 'TO', '2019', 4],
  ['D_TO_201920', 'TO', '2020', 40],

  ['E_PG_201920', 'PG', '2019', 5.5],
  ['E_PG_201920', 'PG', '2020', 55],
];

export const ANALYTIC_RESPONSE_FIXTURES: AnalyticResponseFixture[] = ARRAY_DATA_ELEMENTS.map(
  ([dataElement, organisationUnit, period, value]) => ({
    code: dataElement,
    aggregations: [{ type: 'FINAL_EACH_YEAR' }],
    analytic: { dataElement, organisationUnit, period, value },
  }),
);
