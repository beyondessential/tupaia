/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TransformTable } from '../table';
import { FieldValue } from '../../types';

const keyValueByField = (table: TransformTable, field: string) => {
  const fieldValues = table.getColumnValues(field) as string[];
  const valueValues = table.getColumnValues('value');
  const newColumnNames = Array.from(new Set(fieldValues));
  const newColumns: Record<string, FieldValue[]> = Object.fromEntries(
    newColumnNames.map(columnName => [
      columnName,
      // Flag all values as skip char to avoid overwriting data
      table.hasColumn(columnName)
        ? table.getColumnValues(columnName)
        : new Array(valueValues.length).fill(undefined),
    ]),
  );
  valueValues.forEach((value, index) => {
    const dataElement = fieldValues[index];
    const column = newColumns[dataElement];
    column.splice(index, 1, value);
  });

  const columnUpserts = Object.entries(newColumns).map(([columnName, values]) => ({
    columnName,
    values,
  }));

  return table.dropColumns([field, 'value']).upsertColumns(columnUpserts);
};

/**
 * { period: '20200101', organisationUnit: 'TO', dataElement: 'CH01', value: 7 }
 *  => { period: '20200101', organisationUnit: 'TO', CH01: 7 }
 */
export const keyValueByDataElementName = () => (table: TransformTable) => {
  return keyValueByField(table, 'dataElement');
};

/**
 * { period: '20200101', organisationUnit: 'TO', dataElement: 'CH01', value: 7 }
 *  => { period: '20200101', TO: 7, dataElement: 'CH01' }
 */
export const keyValueByOrgUnit = () => (table: TransformTable) => {
  return keyValueByField(table, 'organisationUnit');
};

/**
 * { period: '20200101', organisationUnit: 'TO', dataElement: 'CH01', value: 7 }
 *  => { 20200101: 7, organisationUnit: 'TO', dataElement: 'CH01' }
 */
export const keyValueByPeriod = () => (table: TransformTable) => {
  return keyValueByField(table, 'period');
};
