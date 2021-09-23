/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { buildDefault } from './default';
import { buildMatrix } from './matrix';

export type ReportOutput = ReturnType<
  ReturnType<typeof outputBuilders[keyof typeof outputBuilders]>
>;

export const outputBuilders = {
  matrix: buildMatrix,
  default: buildDefault,
};
