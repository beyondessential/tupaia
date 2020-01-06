/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import flatten from 'lodash.flatten';

import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { reduceToDictionary } from '/utils';
import { Entity } from '/models';

import { TableConfig } from './TableConfig';
import { getValuesByCell } from './getValuesByCell';

const getColumnId = index => `Col${index + 1}`;

class TableOfDataValuesBuilder extends DataBuilder {
  async build() {
    const results = await this.fetchResults();
    this.tableConfig = new TableConfig(this.config, results);

    const data = {
      rows: await this.buildRows(results),
      columns: await this.buildColumns(),
    };
    if (this.tableConfig.hasRowCategories()) {
      data.categories = await this.buildRowCategories();
    }

    return data;
  }

  async fetchResults() {
    const dataElementCodes = [...new Set(flatten(this.config.cells))];
    const { results } = await this.getAnalytics({ dataElementCodes, outputIdScheme: 'code' });

    return results;
  }

  async buildRows(results) {
    const valuesByCell = getValuesByCell(this.tableConfig, results);

    return this.buildBaseRows().map((baseRow, index) => ({
      ...baseRow,
      ...this.buildRowValues(valuesByCell, index),
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

  buildRowValues(valuesByCell, rowIndex) {
    const values = {};
    this.tableConfig.cells[rowIndex].forEach((cell, index) => {
      values[getColumnId(index)] = valuesByCell[cell];
    });

    return values;
  }

  async buildColumns() {
    const buildColumn = (column, index) => ({ key: getColumnId(index), title: column });

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

export const tableOfDataValues = async ({ dataBuilderConfig, query, entity }, dhisApi) => {
  const builder = new TableOfDataValuesBuilder(dhisApi, dataBuilderConfig, query, entity);
  return builder.build();
};
