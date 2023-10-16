/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import baseCamelFunction, { Options } from 'camelcase-keys';
import { KeysToCamelCase } from '@tupaia/types';

/**
 * Wrapper for camelcaseKeys library function to add correct type interpretation
 *  @returns Input object with keys in camelcase
 */
export function camelcaseKeys<InputType>(
  input: InputType,
  options?: Options,
): KeysToCamelCase<InputType> {
  // Cast through unknown to satisfy typescript, we know it will work correctly
  return (baseCamelFunction(input, options) as unknown) as KeysToCamelCase<InputType>;
}
