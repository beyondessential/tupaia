import { ReportModel as BaseReportModel, ReportRecord as BaseReportRecord } from '@tupaia/database';
import { Report } from '@tupaia/types';
import { Model } from './types';

export interface ReportRecord extends Report, BaseReportRecord {}

export interface ReportModel extends Model<BaseReportModel, Report, ReportRecord> {}
