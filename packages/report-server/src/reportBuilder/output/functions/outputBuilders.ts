/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { buildDefault } from './default';
import { buildMatrix, buildRawDataExport } from './matrix';

type Await<T> = T extends PromiseLike<infer U> ? U : T;

export type OutputType = Await<
  ReturnType<ReturnType<typeof outputBuilders[keyof typeof outputBuilders]>>
>;

export const outputBuilders = {
  matrix: buildMatrix,
  rawDataExport: buildRawDataExport,
  default: buildDefault,
};
