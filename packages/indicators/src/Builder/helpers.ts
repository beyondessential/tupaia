/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { ObjectValidator } from '@tupaia/utils';

export function validateConfig<T extends Record<string, unknown>>(
  config: Record<string, unknown>,
  validators = {},
): asserts config is T {
  new ObjectValidator(validators).validateSync(
    config,
    (error: string, field: string) => new Error(`Error in field '${field}': ${error}`),
  );
}
