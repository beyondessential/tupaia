/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TransformTable } from '../table';

const keyValueByField = (table: TransformTable, field: string) => {
  const newColumns = new Set<string>(
    table.getColumns().filter(columnName => columnName !== field && columnName !== 'value'),
  ); // Do this to preserve the existing column order

  const newRows = table
    .getRows()
    .map(({ [field]: valueOfField, value: valueOfValueColumn, ...restOfRow }) => {
      const newRow = restOfRow;
      if (valueOfField !== undefined && valueOfValueColumn !== undefined) {
        const columnName = `${valueOfField}`;
        newRow[columnName] = valueOfValueColumn;
        newColumns.add(columnName);
      }
      return newRow;
    });

  return new TransformTable(Array.from(newColumns), newRows);
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
