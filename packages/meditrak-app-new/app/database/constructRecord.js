/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import * as DataTypes from './types';
import { snakeToCamelCase } from '../utilities';

export const constructRecord = (database, recordType, recordDetails) => {
  const data = {};
  Object.entries(recordDetails).forEach(([key, value]) => {
    data[snakeToCamelCase(key)] = value;
  });
  return isChangeValid(recordType, data) && DataTypes[recordType].construct(database, data);
};

/**
 * Ensure the change is a recognised record type, and that it contains values for all expected keys
 * @param  {string} recordType The record type of this change
 * @param  {object} record     The data of the updated record
 * @return {boolean}           Whether the data is sufficient to create an internal record from
 */
const isChangeValid = (recordType, record) => {
  if (!record.id || record.id.length < 1) return false; // Every record needs an ID
  if (!DataTypes[recordType] || !DataTypes[recordType].requiredData) return false; // Unsupported record type
  const isValid = DataTypes[recordType].requiredData.reduce(
    (containsAllFieldsSoFar, fieldName) =>
      containsAllFieldsSoFar &&
      record[fieldName] !== null && // Key must exist
      record[fieldName] !== undefined &&
      (typeof record[fieldName] !== 'string' || record[fieldName].length > 0), // Strings must not be blank
    true,
  );
  return isValid;
};
