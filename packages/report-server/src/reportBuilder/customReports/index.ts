/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { Resolved } from '@tupaia/tsutils';
import { FetchReportQuery } from '../../types';
import { ReqContext } from '../context';
import { testCustomReport } from './testCustomReport';

type CustomReportBuilder = (reqContext: ReqContext, query: FetchReportQuery) => Promise<unknown>;

export const customReports: Record<string, CustomReportBuilder> = { testCustomReport };

export type CustomReportOutputType = Resolved<
  ReturnType<typeof customReports[keyof typeof customReports]>
>;
