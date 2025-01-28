import { arrayToAnalytics } from '../../../utils';
import { Analytic } from '../../../types';

/**
 * Code format: `valueHint_orgUnits_periods`
 * Eg for `A_ToPg_20192020`:
 * A => analytic values use 1 (B for 2, C for 3 etc)
 * ToPg => analytics exist for orgUnits: TO, PG
 * 20192020 => analytics exist for periods: 2019, 2020
 */
export const AGGREGATOR_ANALYTICS = arrayToAnalytics([
  ['Zero', 'TO', '2019', 0],
  ['One', 'TO', '2019', 1],
  ['Two', 'TO', '2019', 2],
  ['Three', 'TO', '2019', 3],
  ['Four', 'TO', '2019', 4],
  ['Five', 'TO', '2019', 5],
  ['Covid_Test_Type', 'TO', '2019', 'PCR Tests'],

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
]) as Analytic[];
