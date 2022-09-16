/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { getNursingReport } from './getNursingReport';
import { FetchReportQuery } from '../../types';
import { ReqContext } from '../context';

export const palauNursingMedicalWardReport1 = async (
  reqContext: ReqContext,
  query: FetchReportQuery,
) => {
  const dataSetCode = 'PW_MW01';
  return getNursingReport(reqContext, query, dataSetCode);
};
