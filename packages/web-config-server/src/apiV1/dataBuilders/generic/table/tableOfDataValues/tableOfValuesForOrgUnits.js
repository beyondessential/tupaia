import { TableOfDataValuesBuilder } from './tableOfDataValues';
import { buildBaseRowsForOrgUnit } from './helpers/buildBaseRowsForOrgUnit';

class TableOfValuesForOrgUnitsBuilder extends TableOfDataValuesBuilder {
  buildBaseRows() {
    return buildBaseRowsForOrgUnit(this.tableConfig.rows, undefined, 0, this.config);
  }

  buildRows(columnsRaw) {
    const baseRows = this.buildBaseRows();
    const columns = this.flattenColumnCategories(columnsRaw);
    const { filterEmptyRows } = this.config;
    const rowData = [...baseRows];
    this.results.forEach(({ value, organisationUnit, metadata, dataElement }) => {
      const dataCode = metadata.code || dataElement;
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
