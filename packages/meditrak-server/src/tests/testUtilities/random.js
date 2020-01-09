/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { generateId } from '@tupaia/database';

export function generateValueOfType(type, options = {}) {
  switch (type) {
    case 'text':
    case 'character varying': {
      const text = Math.random()
        .toString(36)
        .substring(2); // 0.sdf -> sdf
      return options.maxLength ? text.substring(0, options.maxLength) : text;
    }
    case 'double precision':
      return Math.random() * 1000;
    case 'boolean':
      return Math.random() >= 0.5;
    case 'timestamp with time zone':
    case 'date':
      return new Date();
    case 'json':
    case 'jsonb':
      return {};
    case 'ARRAY':
      return [];
    case 'USER-DEFINED': // used for postgis columns that knex doesn't understand
      return null;
    default:
      throw new Error(`${type} is not a supported dummy data type`);
  }
}

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

export function randomEmail() {
  return `${Math.random()
    .toString(36)
    .substring(7)}@tupaia.org`;
}

export function randomString() {
  return `string${Math.random()
    .toString(36)
    .substring(7)}`;
}

export function randomIntBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
