/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { Entity } from '/models';
import { TableOfDataValuesBuilder } from './tableOfDataValues';

import { stripFromStart, reduceToDictionary } from '@tupaia/utils';

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
    this.baseRows = this.buildBaseRows();
    const columns = await this.buildColumns();
    this.rowData = this.buildRowData(results, columns);
    const data = {
      rows: Object.values(this.rowData),
      columns: await this.replaceOrgUnitCodesWithNames(columns),
    };

    if (this.config.categoryAggregator) {
      data.categoryRows = this.buildCategoryRows(Object.values(this.rowData));
    }
    if (this.tableConfig.hasRowCategories()) {
      data.categories = await this.buildRowCategories();
    }

    return data;
  }

  //   'C.1.3 Financing mechanism and funds for the timely response to public health emergencies':
  //   { dataElement:
  //      'C.1.3 Financing mechanism and funds for the timely response to public health emergencies',
  //     categoryId: 'Legislation and financing' },
  //  'Nested category':
  //   { categoryId: 'Legislation and financing',
  //     rows: [ 'C.10.1 Capacity for emergency risk communications' ] }
  buildBaseRows() {
    return super.buildBaseRows().reduce((base, { dataElement, categoryId, category, rows }) => {
      if (category) {
        return {
          ...base,
          [category]: { categoryId, rows },
        };
      }
      return {
        ...base,
        [dataElement]: { dataElement, categoryId },
      };
    }, {});
  }

  //   { dataElement:
  //     'C.1.3 Financing mechanism and funds for the timely response to public health emergencies',
  //    categoryId: 'Legislation and financing',
  //    Col3: 40,
  //    Col2: 100,
  //    Col12: 100,
  //    Col10: 100,
  //    Col4: 100,
  //    Col6: 0,
  //    Col11: 20,
  //    Col14: 20,
  //    Col9: 20,
  //    Col7: 80,
  //    Col8: 60,
  //    Col13: 80,
  //    Col1: 100 },
  // 'Nested category':
  //  { categoryId: 'Legislation and financing',
  //    rows: [ 'C.10.1 Capacity for emergency risk communications' ] },
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
        },
      };
    }, this.baseRows);
  }

  // async buildRows() {
  //   return Object.values(this.rowData);
  // }

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
