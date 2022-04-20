/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { ReportServerAggregator } from '../../../../aggregator';
import { Row } from '../../../types';
import { buildParams, matrix } from './matrix';

export const buildExcel = (params: unknown) => {
  const builtParams = buildParams(params);
  return (rows: Row[], aggregator: ReportServerAggregator) =>
    matrix(rows, { ...builtParams, attachAllDataElementsToColumns: true }, aggregator);
};
