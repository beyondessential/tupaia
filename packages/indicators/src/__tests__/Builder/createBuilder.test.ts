/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

/* eslint-disable max-classes-per-file */

import { createAggregator } from '@tupaia/aggregator';
import { ArithmeticBuilder } from '../../Builder/ArithmeticBuilder';
import { createBuilder } from '../../Builder/createBuilder';

const mockBuilderConstructor = jest.fn();

jest.mock('../../Builder/Builder', () => ({
  Builder: class {
    constructor(api: unknown) {
      mockBuilderConstructor(api);
    }
  },
}));
jest.mock('../../Builder/builders', () => {
  const originalModule = jest.requireActual('../../Builder/builders');
  const builders = {
    ...originalModule.builders,
    wrongInterface: class {},
  };

  return {
    __esModule: true,
    ...originalModule,
    builders,
  };
});

describe('createBuilder()', () => {
  const api = {
    getAggregator: () => createAggregator(),
    buildAnalyticsForIndicators: async () => [],
  };

  it('throws an error if a specified builder does not exist', () => {
    expect(() => createBuilder('wrong', api)).toThrow(/is not an indicator builder/);
  });

  it('throws an error if the builder does not extend the base Builder class', () => {
    expect(() => createBuilder('wrongInterface', api)).toThrow(/must extend Builder/);
  });

  it('constructs an existing builder using correct params', () => {
    expect(createBuilder('arithmetic', api)).toBeInstanceOf(ArithmeticBuilder);
    expect(mockBuilderConstructor).toHaveBeenCalledOnceWith(api);
  });
});
