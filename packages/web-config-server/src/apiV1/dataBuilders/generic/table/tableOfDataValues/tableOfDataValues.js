/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import flatten from 'lodash.flatten';
import keyBy from 'lodash.keyby';

import { reduceToDictionary } from '@tupaia/utils';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { Entity } from '/models';

import { TableConfig } from './TableConfig';
import { getValuesByCell } from './getValuesByCell';
import { TotalCalculator } from './TotalCalculator';

const getColumnKey = columnIndex => `Col${parseInt(columnIndex, 10) + 1}`;

export class TableOfDataValuesBuilder extends DataBuilder {
  async build() {
    const results = await this.fetchResults();
    this.tableConfig = new TableConfig(this.config, results);
    this.valuesByCell = getValuesByCell(this.tableConfig, results);
    this.totalCalculator = new TotalCalculator(this.tableConfig, this.valuesByCell);

    const data = {
      rows: await this.buildRows(),
      columns: await this.buildColumns(),
    };
    if (this.tableConfig.hasRowCategories()) {
      const categories = await this.buildRowCategories();
      data.rows = [...data.rows, ...categories];
    }

    return data;
  }

  async fetchResults() {
    const dataElementCodes = [...new Set(flatten(this.config.cells))];
    const { results } = await this.fetchAnalytics(dataElementCodes);
    const dataElements = await this.fetchDataElements(dataElementCodes);
    const dataElementByCode = keyBy(dataElements, 'code');

    return results.map(result => ({
      ...result,
      metadata: dataElementByCode[result.dataElement] || {},
    }));
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
      : this.valuesByCell[cell];
  }

  async buildColumns() {
    const buildColumn = (column, index) => ({ key: getColumnKey(index), title: column });

    if (!this.tableConfig.hasColumnCategories()) {
      return this.tableConfig.columns.map(buildColumn);
    }

    const categoryKeyToTitle = await this.getColumnCategoryToTitle();

    let index = 0;
    return this.tableConfig.columns.map(({ category, columns }) => ({
      category: categoryKeyToTitle(category),
      columns: columns.map(column => buildColumn(column, index++)),
    }));
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
