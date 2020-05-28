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
        return { ...baseRows, [dataElement]: { dataElement, categoryId: parent } };
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
    this.results.forEach(({ value, organisationUnit, metadata }) => {
      const dataElementName = stripFromString(metadata.name, stripFromDataElementNames);
      const orgUnit = columns.find(col => col.title === organisationUnit);
      if (orgUnit) rowData[dataElementName][orgUnit.key] = value;
    });

    if (filterEmptyRows) {
      const cols = columns.map(c => c.key);
      return Object.values(rowData).filter(r => cols.some(x => r[x]));
    }

    return Object.values(rowData);
  }
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
