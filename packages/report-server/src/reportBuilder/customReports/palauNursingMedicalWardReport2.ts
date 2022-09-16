/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { getNursingReport } from './getNursingReport';
import { FetchReportQuery } from '../../types';
import { ReqContext } from '../context';

export const palauNursingMedicalWardReport2 = async (
  reqContext: ReqContext,
  query: FetchReportQuery,
) => {
  const dataSetCode = 'PW_MW02';
  return getNursingReport(reqContext, query, dataSetCode);
};
