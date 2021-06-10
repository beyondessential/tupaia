/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Row } from '../types';
import { outputBuilders } from './functions/outputBuilders';

type OutputParams = {
  type: keyof typeof outputBuilders;
  config: unknown;
};

const output = (rows: Row[], params: OutputParams) => {
  const { type, config } = params;

  const outputBuilder = outputBuilders[type as keyof typeof outputBuilders](config);
  return outputBuilder(rows);
};

const buildParams = (params: unknown): OutputParams => {
  if (typeof params === 'object' && params !== null) {
    const { type = 'default', ...restParams } = params;
    return { type, config: restParams };
  }
  throw new Error(`Expected output config as object but got ${params}`);
};

export const buildOutput = (params: unknown) => {
  const builtParams = buildParams(params);
  return (rows: Row[]) => output(rows, builtParams);
};
