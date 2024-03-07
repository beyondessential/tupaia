/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { ReportModel as BaseReportModel, ReportRecord as BaseReportRecord } from '@tupaia/database';
import { Model } from '@tupaia/server-boilerplate';

export type ReportFields = Readonly<{
  id: string;
  code: string;
  config: Record<string, unknown>;
  permission_group_id: string;
}>;

export interface ReportRecord extends ReportFields, Omit<BaseReportRecord, 'id'> {}

export interface ReportModel extends Model<BaseReportModel, ReportFields, ReportRecord> {}
