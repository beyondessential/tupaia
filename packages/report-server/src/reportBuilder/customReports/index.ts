/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { Resolved } from '@tupaia/tsutils';
import { FetchReportQuery } from '../../types';
import { ReqContext } from '../context';
import { testCustomReport } from './testCustomReport';
import { palauNursingSurgicalWardReport } from './palauNursingSurgicalWardReport';
import { palauNursingDailyWardReport } from './palauNursingDailyWardReport';
import { palauNursingMonthlyIssuesArisingReport } from './palauNursingMonthlyIssuesArisingReport';
import { palauNursingMonthlyOrReport } from './palauNursingMonthlyOrReport';
import { palauNursingMedicalWardReport1 } from './palauNursingMedicalWardReport1';
import { palauNursingMedicalWardReport2 } from './palauNursingMedicalWardReport2';

type CustomReportBuilder = (reqContext: ReqContext, query: FetchReportQuery) => Promise<unknown>;

export const customReports: Record<string, CustomReportBuilder> = {
  testCustomReport,
  palauNursingSurgicalWardReport,
  palauNursingDailyWardReport,
  palauNursingMonthlyIssuesArisingReport,
  palauNursingMonthlyOrReport,
  palauNursingMedicalWardReport1,
  palauNursingMedicalWardReport2,
};

export type CustomReportOutputType = Resolved<
  ReturnType<typeof customReports[keyof typeof customReports]>
>;
