/**
 * @typedef {import('../ModelRegistry').ModelRegistry} ModelRegistry
 * @typedef {import('../records').DatabaseRecordName} DatabaseRecordName
 */

import { resourceToRecordType } from './resourceToRecordType';

/**
 * @param {string} unprocessedColumnSelector
 * @param {DatabaseRecordName} baseRecordType
 * @returns {`${DatabaseRecordName}.${string}`}
 */
export const fullyQualifyColumnSelector = (unprocessedColumnSelector, baseRecordType) => {
  const [resource, column] = unprocessedColumnSelector.includes('.')
    ? unprocessedColumnSelector.split('.')
    : [baseRecordType, unprocessedColumnSelector];
  const recordType = resourceToRecordType(resource);
  return `${recordType}.${column}`;
};

/**
 * @param {ModelRegistry} models
 * @param {string} unprocessedColumnSelector
 * @param {DatabaseRecordName} baseRecordType
 * @returns {string}
 */
export const processColumnSelector = (models, unprocessedColumnSelector, baseRecordType) => {
  const fullyQualifiedSelector = fullyQualifyColumnSelector(
    unprocessedColumnSelector,
    baseRecordType,
  );
  const [recordType, column] = fullyQualifiedSelector.split('.');
  const model = models.getModelForDatabaseRecord(recordType);
  const customSelector = model?.customColumnSelectors?.[column];
  return customSelector ? customSelector(fullyQualifiedSelector) : fullyQualifiedSelector;
};

// Make sure all column keys have the table specified to avoid ambiguous column errors,
// and also transform any resource names into database record types
export const processColumnSelectorKeys = (models, object, recordType) => {
  const processedObject = {};
  Object.entries(object).forEach(([columnSelector, value]) => {
    processedObject[processColumnSelector(models, columnSelector, recordType)] = value;
  });
  return processedObject;
};

/**
 * @param {ModelRegistry} models
 * @param {string[]} unprocessedColumns
 * @param {DatabaseRecordName} recordType
 */
export const processColumns = (models, unprocessedColumns, recordType) => {
  return unprocessedColumns.map(column => ({
    [column]: processColumnSelector(models, column, recordType),
  }));
};
