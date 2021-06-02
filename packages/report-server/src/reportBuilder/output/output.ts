/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Row } from '../types';
import { outputBuilders } from './functions/outputBuilders';

type OutputParams = {
  type: string;
  config: unknown;
};

const output = (rows: Row[], params: OutputParams) => {
  const { type, config } = params;

  const outputBuilder = outputBuilders[type as keyof typeof outputBuilders](config);
  return outputBuilder(rows);
};

const buildParams = (params: unknown): OutputParams => {
  const defaultType = { type: 'default', config: undefined };

  if (typeof params === 'undefined') {
    return defaultType;
  }
  if (typeof params === 'object') {
    if ('matrix' in params) {
      const { matrix } = params;
      if (typeof matrix !== 'object') {
        throw new Error(`Expected matrix config to be an object but got ${matrix}`);
      }
      return { type: 'matrix', config: matrix };
    }
    return defaultType;
  }
  throw new Error(`Expected output config as object but got ${JSON.stringify(params)}`);
};

export const buildOutput = (params: unknown) => {
  const builtParams = buildParams(params);
  return (rows: Row[]) => output(rows, builtParams);
};
