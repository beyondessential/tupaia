/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { Resolved } from '@tupaia/tsutils';
import { ReqContext } from '../context';
import { testCustomReport } from './testCustomReport';
import { tongaCovidRawData } from './tongaCovidRawData';

type CustomReportBuilder = (reqContext: ReqContext) => Promise<unknown>;

export const customReports: Record<string, CustomReportBuilder> = {
  testCustomReport,
  tongaCovidRawData,
};

export type CustomReportOutputType = Resolved<
  ReturnType<typeof customReports[keyof typeof customReports]>
>;
