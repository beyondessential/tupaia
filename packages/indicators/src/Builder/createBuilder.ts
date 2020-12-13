/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { IndicatorApiInterface } from '../types';
import { Builder } from './Builder';
import { builders } from './builders';

export const createBuilder = (builderName: string, api: IndicatorApiInterface) => {
  if (!(builderName in builders)) {
    throw new Error(`'${builderName}' is not an indicator builder`);
  }

  const BuilderClass = builders[builderName as keyof typeof builders];
  if (!(BuilderClass.prototype instanceof Builder)) {
    throw new Error(`'${BuilderClass} must extend Builder`);
  }
  return new BuilderClass(api);
};
