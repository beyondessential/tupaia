/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ObjectValidator } from '@tupaia/utils';
import { AnalyticValue, FetchOptions, IndicatorApiInterface } from '../types';

export abstract class Builder {
  protected indicatorApi: IndicatorApiInterface;

  constructor(indicatorApi: IndicatorApiInterface) {
    this.indicatorApi = indicatorApi;
  }

  abstract async buildAnalyticValues(
    config: Record<string, unknown>,
    fetchOptions: FetchOptions,
  ): Promise<AnalyticValue[]>;

  protected validateConfig = async <T extends Record<string, unknown>>(
    config = {},
    validators = {},
  ): Promise<T> => {
    await new ObjectValidator(validators).validate(
      config,
      (error: string, field: string) => new Error(`Error in field '${field}': ${error}`),
    );
    // Ideally we wouldn't return a value; we would define the return type as `asserts config is T`
    // Since async assertions are not supported yet, we return the asserted type as a workaround:
    // https://github.com/microsoft/TypeScript/issues/37515
    return config as T;
  };
}
