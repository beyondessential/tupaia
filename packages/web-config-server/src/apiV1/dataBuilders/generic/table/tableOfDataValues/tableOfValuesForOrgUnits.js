/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { Entity } from '/models';
import { TableOfDataValuesBuilder } from './tableOfDataValues';

import { stripFromStart, reduceToDictionary, reduceToSet } from '@tupaia/utils';

import { TableConfig } from './TableConfig';
import { getValuesByCell } from './getValuesByCell';
import { TotalCalculator } from './TotalCalculator';

const ROW_KEYS_TO_IGNORE = ['dataElement', 'categoryId'];
const BUILD_ORGS_FROM_RESULTS = '$orgUnit';
const CATEGORY_AGGREGATION_TYPES = {
  AVERAGE: '$average',
};

class TableOfValuesForOrgUnitsBuilder extends TableOfDataValuesBuilder {
  async build() {
    const results = await this.fetchResults();
    this.tableConfig = new TableConfig(this.config, results);
    this.valuesByCell = getValuesByCell(this.tableConfig, results);
    this.totalCalculator = new TotalCalculator(this.tableConfig, this.valuesByCell);
    this.baseRows = this.buildBaseRows();

    if (this.tableConfig.columns === BUILD_ORGS_FROM_RESULTS) this.buildOrgsFromResults(results);
    const columns = await this.buildColumns();

    this.rowData = this.buildRowData(results, columns);
    const data = {
      rows: Object.values(this.rowData),
      columns: await this.replaceOrgUnitCodesWithNames(columns),
    };

    if (this.tableConfig.hasRowCategories()) {
      const categories = await this.buildRowCategories();

      if (this.config.categoryAggregator) {
        const categoryData = this.buildCategoryData(Object.values(this.rowData));
        data.rows = [...data.rows, ...categories.map(c => ({ ...c, ...categoryData[c.category] }))];
      } else {
        data.rows = [...data.rows, ...categories];
      }
    }

    return data;
  }

  buildBaseRows() {
    const { stripFromDataElementNames } = this.config;
    return super.buildBaseRows().reduce((base, { dataElement, categoryId, category, rows }) => {
      if (category) {
        return {
          ...base,
          [category]: { categoryId, rows },
        };
      }
      // const strippedName = stripFromStart(dataElement, stripFromDataElementNames);
      return {
        ...base,
        [stripFromStart(dataElement, stripFromDataElementNames)]: { dataElement, categoryId },
      };
    }, {});
  }

  buildRowData(results, columns) {
    const { stripFromDataElementNames } = this.config;

    return results.reduce((valuesPerElement, { value, organisationUnit, metadata }) => {
      const dataElementName = stripFromStart(metadata.name, stripFromDataElementNames);
      const orgUnit = columns.find(col => col.title === organisationUnit);
      const row = valuesPerElement[dataElementName];

      // still want to populate rows without values to display no data
      if (orgUnit) row[orgUnit.key] = value;

      return {
        ...valuesPerElement,
        [dataElementName]: {
          ...row,
          dataElement: dataElementName,
        },
      };
    }, this.baseRows);
  }

  buildCategoryData(rows) {
    const totals = this.calculateCategoryTotals(rows);

    if (this.config.categoryAggregator === CATEGORY_AGGREGATION_TYPES.AVERAGE) {
      const categoryRowLengths = rows.reduce(
        (lengths, row) => ({ ...lengths, [row.categoryId]: lengths[row.categoryId] + 1 || 1 }),
        {},
      );

      return Object.entries(totals).reduce((averages, [category, columns]) => {
        const averagedColumns = {};
        for (const column in columns) {
          averagedColumns[column] = Math.round(columns[column] / categoryRowLengths[category]);
        }

        return { ...averages, [category]: averagedColumns };
      }, {});
    }

    return totals;
  }

  calculateCategoryTotals(rows) {
    return rows.reduce((columnAggregates, row) => {
      const categoryId = row.categoryId;
      const categoryCols = columnAggregates[categoryId] || {};
      Object.keys(row).forEach(key => {
        if (!ROW_KEYS_TO_IGNORE.includes(key)) {
          categoryCols[key] = (categoryCols[key] || 0) + (row[key] || 0);
        }
      });

      return { ...columnAggregates, [categoryId]: categoryCols };
    }, {});
  }

  buildOrgsFromResults(results) {
    const orgUnitsWithData = reduceToSet(results, 'organisationUnit');
    this.tableConfig.columns = Array.from(orgUnitsWithData);
  }

  async replaceOrgUnitCodesWithNames(columns) {
    const orgUnitCodes = columns.map(c => c.title);
    const orgUnits = await Entity.find({ code: orgUnitCodes });
    const orgUnitCodesToName = reduceToDictionary(orgUnits, 'code', 'name');

    return columns.map(({ title, key }) => ({ key, title: orgUnitCodesToName[title] }));
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
