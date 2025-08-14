import baseCamelFunction, { Options } from 'camelcase-keys';
import { KeysToCamelCase } from '@tupaia/types';
import { isObject } from './typeGuards';

/**
 * Wrapper for camelcaseKeys library function to add correct type interpretation
 *  @returns Input object with keys in camelcase
 */
export function camelcaseKeys<InputType>(input: InputType, options?: Options) {
  if (isObject(input) || Array.isArray(input)) {
    return baseCamelFunction(input, options) as KeysToCamelCase<InputType>;
  }
  return input as KeysToCamelCase<InputType>;
}
