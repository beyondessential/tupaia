/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Resolved } from '@tupaia/tsutils';
import { buildDefault } from './default';
import { buildMatrix } from './matrix';
import { buildRawDataExport } from './rawDataExport';

export type OutputType = Resolved<
  ReturnType<ReturnType<typeof outputBuilders[keyof typeof outputBuilders]>>
>;

export const outputBuilders = {
  matrix: buildMatrix,
  rawDataExport: buildRawDataExport,
  default: buildDefault,
};
