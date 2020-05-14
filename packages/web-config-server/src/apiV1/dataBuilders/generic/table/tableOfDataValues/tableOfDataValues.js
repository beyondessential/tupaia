/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import flatten from 'lodash.flatten';
import keyBy from 'lodash.keyby';

import { reduceToDictionary, reduceToSet } from '@tupaia/utils';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { Entity } from '/models';

import { TableConfig } from './TableConfig';
import { getValuesByCell } from './getValuesByCell';
import { TotalCalculator } from './TotalCalculator';

const getColumnKey = columnIndex => `Col${parseInt(columnIndex, 10) + 1}`;

const METADATA_ROW_KEYS = ['dataElement', 'categoryId'];
const ORG_UNIT_COL_KEY = '$orgUnit';
const ORG_UNIT_WITH_TYPE_COL_KEY = '$orgUnitTypeName';
const CATEGORY_AGGREGATION_TYPES = {
  AVERAGE: '$average',
};

export class TableOfDataValuesBuilder extends DataBuilder {
  async build() {
    const { results, period } = await this.fetchAnalyticsAndMetadata();
    this.results = results;
    this.tableConfig = new TableConfig(this.config, this.results);
    this.baseRows = this.buildBaseRows();
    this.valuesByCell = this.buildValuesByCell();
    this.totalCalculator = new TotalCalculator(this.tableConfig, this.valuesByCell);

    const columns = await this.buildColumns();
    const rows = await this.buildRows(columns);
    const data = { columns, rows, period };

    if (this.tableConfig.hasRowCategories()) {
      const categories = await this.buildRowCategories();

      if (this.config.categoryAggregator) {
        const categoryData = this.buildCategoryData(Object.values(rows));
        data.rows = [...rows, ...categories.map(c => ({ ...c, ...categoryData[c.category] }))];
      } else {
        data.rows = [...rows, ...categories];
      }
    }

    if (
      this.tableConfig.columnType === ORG_UNIT_COL_KEY ||
      this.tableConfig.columnType === ORG_UNIT_WITH_TYPE_COL_KEY
    ) {
      data.columns = await this.replaceOrgUnitCodesWithNames(data.columns);
    }
    return data;
  }

  async fetchAnalyticsAndMetadata() {
    const dataElementCodes = this.buildDataElementCodes();
    const { results, period } = await this.fetchAnalytics(dataElementCodes);
    const dataElements = await this.fetchDataElements(dataElementCodes);
    const dataElementByCode = keyBy(dataElements, 'code');
    const resultsWithMetadata = results.map(result => ({
      ...result,
      metadata: dataElementByCode[result.dataElement] || {},
    }));

    return { results: resultsWithMetadata, period };
  }

  buildDataElementCodes() {
    return [...new Set(flatten(this.config.cells))];
  }

  buildValuesByCell() {
    return getValuesByCell(this.tableConfig, this.results);
  }

  async buildRows() {
    return this.buildBaseRows().map((baseRow, rowIndex) => ({
      ...baseRow,
      ...this.buildRowValues(rowIndex),
    }));
  }

  /**
   * @returns {{ dataElement: string, categoryId: (string:undefined) }}
   */
  buildBaseRows() {
    return this.tableConfig.hasRowCategories()
      ? flatten(
          this.tableConfig.rows.map(({ category: categoryId, rows }) => {
            return rows.map(dataElement => {
              if (dataElement.category) {
                return {
                  category: dataElement.category,
                  categoryId,
                  rows: dataElement.rows || rows,
                };
              }
              return { dataElement, categoryId };
            });
          }),
        )
      : this.tableConfig.rows.map(dataElement => ({ dataElement }));
  }

  buildRowValues(rowIndex) {
    const values = {};
    Object.keys(this.tableConfig.cells[rowIndex]).forEach(columnIndex => {
      values[getColumnKey(columnIndex)] = this.calculateValue(rowIndex, columnIndex);
    });

    return values;
  }

  calculateValue(rowIndex, columnIndex) {
    const cell = this.tableConfig.cells[rowIndex][columnIndex];
    if (!cell) {
      return '';
    }

    return TotalCalculator.isTotalKey(cell)
      ? this.totalCalculator.calculate(rowIndex, columnIndex)
      : this.valuesByCell[this.getCellKey(rowIndex, columnIndex)];
  }

  getCellKey(rowIndex, columnIndex) {
    return this.tableConfig.cells[rowIndex][columnIndex];
  }

  async buildColumns() {
    const buildColumn = (column, index) => ({ key: getColumnKey(index), title: column });
    this.tableConfig.columnType = this.tableConfig.columns;

    if (this.tableConfig.hasColumnMetadataTranslator()) {
      this.results = await this.tableConfig.processColumnMetadataTranslator(this.results);
    }

    if (this.tableConfig.columnType === ORG_UNIT_COL_KEY) this.buildOrgsFromResults();

    if (this.tableConfig.columnType === ORG_UNIT_WITH_TYPE_COL_KEY)
      this.buildOrgsFromResultsWithCategories();

    if (!this.hasColumnsInCategories(this.tableConfig.columns)) {
      return this.tableConfig.columns.map(buildColumn);
    }

    const categoryKeyToTitle = await this.getColumnCategoryToTitle();

    let index = 0;
    const builtColumns = this.tableConfig.columns.map(({ category, columns }) => ({
      category: categoryKeyToTitle(category),
      columns: columns.map(column => buildColumn(column, index++)),
    }));

    return builtColumns;
  }

  /**
   * Recursively builds an array of categories, including sub categories,
   * no matter how deeply they are nested.
   *
   * @param {Array} rows
   * @param {Array} categories
   */
  async buildRowCategories(rows = this.tableConfig.rows, categories = []) {
    if (rows.length === 0) return categories;
    const categoryToTitle = await this.getRowCategoryToTitle();

    const row = rows[0];
    const categoryName = row.category;

    if (row.rows) {
      const subCategories = row.rows
        .filter(r => typeof r !== 'string')
        .map(r => ({ ...r, parent: categoryName }));

      const category = { category: categoryToTitle(categoryName) };
      if (row.parent) category.categoryId = row.parent;
      return this.buildRowCategories(
        [...rows.slice(1), ...subCategories],
        [...categories, category],
      );
    }

    return this.buildRowCategories(rows.slice(1), [...categories]);
  }

  async getRowCategoryToTitle() {
    return this.tableConfig.hasOrgUnitRowCategories()
      ? this.getOrgUnitCategoryToTitle(this.tableConfig.rows)
      : key => key;
  }

  async getColumnCategoryToTitle() {
    return this.tableConfig.hasOrgUnitColumnCategories()
      ? this.getOrgUnitCategoryToTitle(this.tableConfig.columns)
      : key => key;
  }

  getOrgUnitCategoryToTitle = async dimension => {
    const orgUnitCodes = dimension.map(({ category }) => category);
    const orgUnits = await Entity.find({ code: orgUnitCodes });
    const orgUnitCodeToName = reduceToDictionary(orgUnits, 'code', 'name');

    return code => orgUnitCodeToName[code];
  };

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

  calculateCategoryTotals = rows => {
    const rowKeysToIgnore = new Set(METADATA_ROW_KEYS);
    return rows.reduce((columnAggregates, row) => {
      const categoryId = row.categoryId;
      const categoryTotals = columnAggregates[categoryId] || {};
      Object.keys(row).forEach(key => {
        if (!rowKeysToIgnore.has(key)) {
          categoryTotals[key] = (categoryTotals[key] || 0) + (row[key] || 0);
        }
      });

      return { ...columnAggregates, [categoryId]: categoryTotals };
    }, {});
  };

  buildOrgsFromResults() {
    const orgUnitsWithData = reduceToSet(this.results, 'organisationUnit');
    this.tableConfig.columns = Array.from(orgUnitsWithData);
  }

  buildOrgsFromResultsWithCategories() {
    const types = reduceToDictionary(this.results, 'typeName', 'categoryCode');
    const sortedTypes = Object.keys(types).sort((a, b) => types[a] - types[b]);
    const orgUnitTypes = reduceToDictionary(this.results, 'organisationUnit', 'typeName');
    const columnCategories = new Map(sortedTypes.map(cat => [cat, []]));
    Object.keys(orgUnitTypes).forEach(org => {
      columnCategories.get(orgUnitTypes[org]).push(org);
    });
    const columns = [];
    columnCategories.forEach((cols, cat) => {
      columns.push({ category: cat, columns: cols });
    });
    this.tableConfig.columns = columns;
  }

  replaceOrgUnitCodesWithNames = async columns => {
    const orgUnitCodesToName = await this.fetchOrgUnitCodesToName(
      this.flattenColumnCategories(columns),
    );
    const swapNames = ({ title, key }) => ({ key, title: orgUnitCodesToName[title] });

    if (this.hasColumnsInCategories(columns)) {
      const updatedColumns = columns.map(category => {
        const newColumns = category.columns.map(swapNames);
        return { ...category, columns: newColumns };
      });
      return updatedColumns;
    }
    return columns.map(swapNames);
  };

  fetchOrgUnitCodesToName = async columns => {
    const orgUnitCodes = columns.map(c => c.title);
    const orgUnits = await Entity.find({ code: orgUnitCodes });
    return reduceToDictionary(orgUnits, 'code', 'name');
  };

  flattenColumnCategories = columns => {
    return this.hasColumnsInCategories(columns)
      ? [].concat(...columns.map(categories => categories.columns))
      : columns;
  };

  hasColumnsInCategories = columns => {
    return columns[0] && columns[0].hasOwnProperty('category');
  };
}

export const tableOfDataValues = async (
  { dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const builder = new TableOfDataValuesBuilder(
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    aggregator.aggregationTypes.SUM_MOST_RECENT_PER_FACILITY,
  );
  return builder.build();
};
