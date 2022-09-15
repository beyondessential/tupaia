/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { Resolved } from '@tupaia/tsutils';
import { FetchReportQuery } from '../../types';
import { ReqContext } from '../context';
import { testCustomReport } from './testCustomReport';
import { tongaCovidRawData } from './tongaCovidRawData';
import { tongaCovidRawDataFaster } from './tongaCovidRawDataFaster';

type CustomReportBuilder = (reqContext: ReqContext, query: FetchReportQuery) => Promise<unknown>;

export const customReports: Record<string, CustomReportBuilder> = {
  testCustomReport,
  tongaCovidRawData,
  tongaCovidRawDataFaster,
};

export type CustomReportOutputType = Resolved<
  ReturnType<typeof customReports[keyof typeof customReports]>
>;
