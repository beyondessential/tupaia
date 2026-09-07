/**
 * @typedef {import('../ModelRegistry').ModelRegistry} ModelRegistry
 * @typedef {import('../records').PublicSchemaRecordName} PublicSchemaRecordName
 */

import { QUERY_CONJUNCTIONS } from '../BaseDatabase';
import { resourceToRecordType } from './resourceToRecordType';

/**
 * @param {string} unprocessedColumnSelector
 * @param {PublicSchemaRecordName} baseRecordType
 * @returns {`${PublicSchemaRecordName}.${string}`}
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
 * @param {PublicSchemaRecordName} baseRecordType
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
    if (columnSelector === QUERY_CONJUNCTIONS.AND || columnSelector === QUERY_CONJUNCTIONS.OR) {
      // _and_/_or_ are bracketing operators, not columns. Keep the key as-is and
      // qualify the column selectors nested inside, so addWhereClause still sees
      // the conjunction (and the inner columns stay unambiguous across joins).
      processedObject[columnSelector] = processColumnSelectorKeys(models, value, recordType);
    } else {
      processedObject[processColumnSelector(models, columnSelector, recordType)] = value;
    }
  });
  return processedObject;
};

/**
 * @param {readonly ModelRegistry} models
 * @param {readonly string[]} unprocessedColumns
 * @param {readonly PublicSchemaRecordName} recordType
 */
export const processColumns = (models, unprocessedColumns, recordType) => {
  return unprocessedColumns.map(column => ({
    [column]: processColumnSelector(models, column, recordType),
  }));
};
