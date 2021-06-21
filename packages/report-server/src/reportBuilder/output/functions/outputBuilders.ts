/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { buildDefault } from './default';
import { buildMatrix } from './matrix';
import { buildBar } from './bar';

export type OutputType = ReturnType<ReturnType<typeof outputBuilders[keyof typeof outputBuilders]>>;

export const outputBuilders = {
  bar: buildBar,
  matrix: buildMatrix,
  default: buildDefault,
};
