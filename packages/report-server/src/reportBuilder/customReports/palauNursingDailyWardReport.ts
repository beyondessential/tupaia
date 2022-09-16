/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { getNursingReport } from './getNursingReport';
import { FetchReportQuery } from '../../types';
import { ReqContext } from '../context';

export const palauNursingDailyWardReport = async (
  reqContext: ReqContext,
  query: FetchReportQuery,
) => {
  const dataSetCode = 'PW_ER01';
  return getNursingReport(reqContext, query, dataSetCode);
};
