/**
 * Tupaia Config Server
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import flatten from 'lodash.flatten';
import flattenDeep from 'lodash.flattendeep';

import { getCalculatedValuesByCell } from './helpers/getValuesByCell';
import { getDataElementsFromCalculateOperationConfig } from '/apiV1/dataBuilders/helpers';

import { TableOfDataValuesBuilder } from './tableOfDataValues';

export class TableOfCalculatedValuesBuilder extends TableOfDataValuesBuilder {
  buildDataElementCodes() {
    const dataElementCodes = flattenDeep(
      this.config.cells.map(row =>
        row.map(cell =>
          typeof cell === 'string' ? cell : getDataElementsFromCalculateOperationConfig(cell),
        ),
      ),
    );
    return [...new Set(dataElementCodes)];
  }

  getCellKey(rowIndex, columnIndex) {
    return (
      this.tableConfig.cells[rowIndex][columnIndex].key ??
      this.tableConfig.cells[rowIndex][columnIndex]
    );
  }

  async buildValuesByCell() {
    const hierarchyId = await this.fetchEntityHierarchyId();
    const filterOptions = ['dataElement'];
    // Add `key` to each cell to match the config of `TableOfCalculatedValues` data builder
    if (this.config.addDynamicKey === true) {
      this.columns = await this.buildColumns();
      this.tableConfig.cells.forEach((cell, rowKey) => {
        this.tableConfig.cells[rowKey] = this.columns.map(({ key: columnKey, title }) => ({
          key: `row${rowKey}_${columnKey}`,
          organisationUnit: title,
          ...cell[0],
        }));
      });
      filterOptions.push('organisationUnit');
    }

    return getCalculatedValuesByCell(this.models, flatten(this.tableConfig.cells), this.results, {
      hierarchyId,
      filterOptions,
    });
  }
}

export const tableOfCalculatedValues = async (
  { models, dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const builder = new TableOfCalculatedValuesBuilder(
    models,
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
  );
  return builder.build();
};
