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

  const outputBuilder = outputBuilders[type](config);
  return outputBuilder(rows);
};

const buildParams = (params: unknown): OutputParams => {
  const isOutPutBuildersType = (value: string): value is keyof typeof outputBuilders => {
    return Object.keys(outputBuilders).includes(value);
  };
  if (typeof params === 'object' && params !== null) {
    const { type = 'default', ...restParams } = params;
    if (typeof type !== 'string' || !isOutPutBuildersType(type)) {
      throw new Error(`Expected type to be one of ${Object.keys(outputBuilders)} but got ${type}`);
    }
    return { type, config: restParams };
  }
  return { type: 'default', config: 'undefined' };
};

export const buildOutput = (params: unknown) => {
  const builtParams = buildParams(params);
  return (rows: Row[]) => output(rows, builtParams);
};
