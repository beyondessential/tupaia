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
      data.categories = await this.buildRowCategories();
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
          this.tableConfig.rows.map(({ category: categoryId, rows }) =>
            rows.map(dataElement => ({ dataElement, categoryId })),
          ),
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

  async buildRowCategories() {
    const categoryToTitle = await this.getRowCategoryToTitle();

    return this.tableConfig.rows.map(({ category }) => ({
      key: category,
      title: categoryToTitle(category),
    }));
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
  );
  return builder.build();
};
