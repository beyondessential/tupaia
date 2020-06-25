/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { TableOfDataValuesBuilder } from './tableOfDataValues';

import { stripFromString } from '@tupaia/utils';

class TableOfValuesForOrgUnitsBuilder extends TableOfDataValuesBuilder {
  /**
   * @returns {
   *  dataElement: { dataElement, categoryId }
   * }
   */

  buildBaseRows(rows = this.tableConfig.rows, parent = undefined) {
    const { stripFromDataElementNames } = this.config;
    return rows.reduce((baseRows, row) => {
      if (typeof row === 'string') {
        const dataElement = stripFromString(row, stripFromDataElementNames);
        const key = parent ? `${dataElement}|${parent}` : dataElement;
        return { ...baseRows, [key]: { dataElement, categoryId: parent } };
      }

      const next = this.buildBaseRows(row.rows, row.category);
      return { ...baseRows, ...next };
    }, {});
  }

  buildRows(columnsRaw) {
    const baseRows = this.buildBaseRows();
    const columns = this.flattenColumnCategories(columnsRaw);
    const { stripFromDataElementNames, filterEmptyRows } = this.config;
    const rowData = { ...baseRows };
    const cachedDataElementNameToCategories = {};

    this.results.forEach(({ value, organisationUnit, metadata }) => {
      const dataElementName = stripFromString(metadata.name, stripFromDataElementNames);
      const orgUnit = columns.find(col => col.title === organisationUnit);

      if (orgUnit) {
        if (rowData[dataElementName]) {
          rowData[dataElementName][orgUnit.key] = value;
        } else {
          let rowCategories = cachedDataElementNameToCategories[dataElementName];
          if (!rowCategories) {
            rowCategories = this.returnCategoriesOfARow(dataElementName, baseRows);
            cachedDataElementNameToCategories[dataElementName] = rowCategories;
          }

          rowCategories.forEach(rowCategory => {
            const key = `${dataElementName}|${rowCategory}`;

            if (rowData[key]) {
              rowData[key][orgUnit.key] = value;
            }
          });
        }
      }
    });

    if (filterEmptyRows) {
      const cols = columns.map(c => c.key);
      return Object.values(rowData).filter(r => cols.some(x => r[x]));
    }

    return Object.values(rowData);
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
  { dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const builder = new TableOfValuesForOrgUnitsBuilder(
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
  );
  return builder.build();
};
