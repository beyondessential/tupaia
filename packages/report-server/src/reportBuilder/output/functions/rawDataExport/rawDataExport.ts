/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';

import { ReportServerAggregator } from '../../../../aggregator';
import { TransformTable } from '../../../transform';
import { OutputContext } from '../../types';
import { RawDataExportBuilder } from './rawDataExportBuilder';
import { RawDataExport, RawDataExportContext } from './types';

const contextValidator = yup.object().shape({
  dataGroups: yup.array().of(yup.string().required()).required().min(1),
});

const rawDataExport = async (
  table: TransformTable,
  params: unknown,
  outputContext: RawDataExportContext,
  aggregator: ReportServerAggregator,
): Promise<RawDataExport> => {
  return new RawDataExportBuilder(table, params, outputContext, aggregator).build();
};

const buildParams = (params: unknown): unknown => {
  return params;
};

const buildContext = (outputContext: OutputContext): RawDataExportContext => {
  const validatedContext = contextValidator.validateSync(outputContext);
  return { dataGroups: validatedContext.dataGroups };
};

export const buildRawDataExport = (params: unknown, outputContext: OutputContext) => {
  const builtParams = buildParams(params);
  const builtOutputContext = buildContext(outputContext);

  return (table: TransformTable, aggregator: ReportServerAggregator) =>
    rawDataExport(table, builtParams, builtOutputContext, aggregator);
};
