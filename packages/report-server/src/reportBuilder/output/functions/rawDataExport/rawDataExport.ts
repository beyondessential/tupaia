import { ReportServerAggregator } from '../../../../aggregator';
import { TransformTable } from '../../../transform';
import { RawDataExportBuilder } from './rawDataExportBuilder';
import { RawDataExport } from './types';

const rawDataExport = async (
  table: TransformTable,
  params: unknown,
  aggregator: ReportServerAggregator,
): Promise<RawDataExport> => {
  return new RawDataExportBuilder(table, params, aggregator).build();
};

const buildParams = (params: unknown): unknown => {
  return params;
};

export const buildRawDataExport = (params: unknown) => {
  const builtParams = buildParams(params);

  return (table: TransformTable, aggregator: ReportServerAggregator) =>
    rawDataExport(table, builtParams, aggregator);
};
