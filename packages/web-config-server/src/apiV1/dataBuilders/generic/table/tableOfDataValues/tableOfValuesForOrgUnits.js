/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { reduceToDictionary } from '@tupaia/utils';
import { Entity } from '/models';
import { TableOfDataValuesBuilder } from './tableOfDataValues';

import { stripFromStart } from '@tupaia/utils';

import { TableConfig } from './TableConfig';
import { getValuesByCell } from './getValuesByCell';
import { TotalCalculator } from './TotalCalculator';

const ROW_KEYS_TO_IGNORE = ['dataElement', 'categoryId'];
const CATEGORY_AGGREGATION_TYPES = {
  AVERAGE: '$average',
};

class TableOfValuesForOrgUnitsBuilder extends TableOfDataValuesBuilder {
  async build() {
    const results = await this.fetchResults();
    this.tableConfig = new TableConfig(this.config, results);
    this.valuesByCell = getValuesByCell(this.tableConfig, results);
    this.totalCalculator = new TotalCalculator(this.tableConfig, this.valuesByCell);

    const columns = await this.buildColumns();
    const rows = await this.buildRows(results, columns);

    const data = {
      rows,
      columns: await this.replaceOrgUnitCodesWithNames(columns),
      categoryRows: this.buildCategoryRows(rows),
    };
    if (this.tableConfig.hasRowCategories()) {
      data.categories = await this.buildRowCategories();
    }

    return data;
  }

  async buildRows(results, builtColumns) {
    const { rows, stripFromDataElementNames } = this.config;
    const rowData = results.reduce(
      (valuesPerElement, { dataElement, value, organisationUnit, metadata }) => {
        const dataElementName = stripFromStart(metadata.name, stripFromDataElementNames);
        const categoryId = rows.find(row => row.rows.includes(dataElementName)).category;
        const orgUnit = builtColumns.find(col => col.title === organisationUnit);

        const row = valuesPerElement[dataElement] || {
          dataElement: dataElementName,
          categoryId,
        };

        // still want to populate rows without values to display no data
        if (orgUnit) row[orgUnit.key] = value;

        return {
          ...valuesPerElement,
          [dataElement]: {
            ...row,
          },
        };
      },
      {},
    );

    return Object.values(rowData);
  }

  buildCategoryRows(rows) {
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

  async replaceOrgUnitCodesWithNames(columns) {
    const orgUnitCodes = columns.map(c => c.title);
    const orgUnits = await Entity.find({ code: orgUnitCodes });
    const orgUnitCodesToName = reduceToDictionary(orgUnits, 'code', 'name');

    return columns.map(({ title, key }) => ({ key, title: orgUnitCodesToName[title] }));
  }
}

export const tableOfValuesForOrgUnits = async ({ dataBuilderConfig, query, entity }, dhisApi) => {
  const builder = new TableOfValuesForOrgUnitsBuilder(dhisApi, dataBuilderConfig, query, entity);
  return builder.build();
};
