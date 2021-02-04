/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Indicator } from '../types';
import { Builder } from './Builder';
import { builders } from './builders';

export const createBuilder = (indicator: Indicator, isRoot?: boolean) => {
  const { builder: builderName } = indicator;
  if (!(builderName in builders)) {
    throw new Error(`'${builderName}' is not an indicator builder`);
  }

  const BuilderClass = builders[builderName as keyof typeof builders];
  if (!(BuilderClass.prototype instanceof Builder)) {
    throw new Error(`'${BuilderClass} must extend Builder`);
  }
  return new BuilderClass(indicator, isRoot);
};
