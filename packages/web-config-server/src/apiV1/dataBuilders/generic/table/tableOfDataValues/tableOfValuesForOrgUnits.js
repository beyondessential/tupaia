/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import flatten from 'lodash.flatten';
import { stripFromString } from '@tupaia/utils';
import { TableOfDataValuesBuilder } from './tableOfDataValues';

class TableOfValuesForOrgUnitsBuilder extends TableOfDataValuesBuilder {
  /**
   * @returns {
   *  dataElement: { dataElement, categoryId }
   * }
   */

  buildBaseRows(rows = this.tableConfig.rows, parent = undefined, baseCellIndex = 0) {
    const { stripFromDataElementNames, cells } = this.config;
    const flatCells = flatten(cells);
    let currentCellIndex = baseCellIndex;
    return rows.reduce((baseRows, row) => {
      if (typeof row === 'string') {
        const dataElement = stripFromString(row, stripFromDataElementNames);
        const dataCode = flatCells[currentCellIndex];
        currentCellIndex++;
        return [...baseRows, { dataCode, dataElement, categoryId: parent }];
      }

      const next = this.buildBaseRows(row.rows, row.category, currentCellIndex);
      currentCellIndex += next.length;
      return [...baseRows, ...next];
    }, []);
  }

  buildRows(columnsRaw) {
    const baseRows = this.buildBaseRows();
    const columns = this.flattenColumnCategories(columnsRaw);
    const { filterEmptyRows } = this.config;
    const rowData = [...baseRows];
    this.results.forEach(({ value, organisationUnit, metadata }) => {
      const dataCode = metadata.code;
      const orgUnit = columns.find(col => col.title === organisationUnit);
      if (orgUnit) {
        rowData
          .filter(row => row.dataCode === dataCode)
          .forEach(row => {
            row[orgUnit.key] = value;
          });
      }
    });

    // Clean unneeded fields from rowData object
    const cleanedRows = rowData.map(row => {
      const { dataCode, categoryId, ...restOfRow } = row;
      return categoryId ? { categoryId, ...restOfRow } : { ...restOfRow };
    });

    if (filterEmptyRows) {
      const cols = columns.map(c => c.key);
      return cleanedRows.filter(r => cols.some(x => r[x]));
    }

    return cleanedRows;
  }

  /**
   * Return a list of categories that this row is in (A row can be in multiple categories)
   */
  returnCategoriesOfARow = (rowName, rows) => {
    const rowCategories = [];

    Object.values(rows).forEach(row => {
      if (row.dataElement === rowName && row.categoryId) {
        rowCategories.push(row.categoryId);
      }
    });

    return rowCategories;
  };
}

export const tableOfValuesForOrgUnits = async (
  { models, dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const builder = new TableOfValuesForOrgUnitsBuilder(
    models,
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
  );
  return builder.build();
};
