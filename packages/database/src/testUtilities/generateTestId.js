/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { generateId } from '../utilities';

/**
 * Generates an id that has similar properties to regular ids, but can be identified as test data
 * for easy cleanup
 * - Includes mongoid date segment in first 8 characters
 * - Uses final characters from standard id generation to ensure uniqueness
 */
export function generateTestId() {
  const fullId = generateId();
  const dateSegment = fullId.substring(0, 8);
  const restOfId = fullId.substring(8);
  return `${dateSegment}_test${restOfId.substring(5)}`;
}
