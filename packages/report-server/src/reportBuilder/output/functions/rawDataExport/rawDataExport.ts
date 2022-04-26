/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';

import { ReportServerAggregator } from '../../../../aggregator';
import { Row } from '../../../types';
import { RawDataExportBuilder } from './rawDataExportBuilder';
import { RawDataExport, RawDataExportParams } from './types';

const paramsValidator = yup.object().shape({
  dataGroups: yup.array().of(yup.string().required()).required().min(1),
});

export const rawDataExport = async (
  rows: Row[],
  params: RawDataExportParams,
  aggregator: ReportServerAggregator,
): Promise<RawDataExport> => {
  return new RawDataExportBuilder(rows, params, aggregator).build();
};

export const buildParams = (params: unknown): RawDataExportParams => {
  const validatedParams = paramsValidator.validateSync(params);
  return { dataGroups: validatedParams.dataGroups };
};

export const buildRawDataExport = (params: unknown) => {
  const builtParams = buildParams(params);

  return (rows: Row[], aggregator: ReportServerAggregator) =>
    rawDataExport(rows, builtParams, aggregator);
};
