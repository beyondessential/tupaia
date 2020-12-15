/**
 * Tupaia Config Server
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import flatten from 'lodash.flatten';
import { TableConfig } from './TableConfig';
import { buildBaseRowsForOrgUnit } from './buildBaseRowsForOrgUnit';
import { getCalculatedValuesByCell } from './getValuesByCell';
import { buildColumnSummary, buildRowSummary } from './addSummaryToTable';
import { TotalCalculator } from './TotalCalculator';
import { TableOfCalculatedValuesBuilder } from './tableOfCalculatedValues';

class TableOfCalculatedValuesForOrgUnitsBuilder extends TableOfCalculatedValuesBuilder {
  async build() {
    const { results, period } = await this.fetchAnalyticsAndMetadata();
    this.results = results;
    this.tableConfig = new TableConfig(this.models, this.config, this.results);
    // Build columns first because `buildValuesByCell` function depends on it
    const columns = await this.buildColumns();
    this.valuesByCell = await this.buildValuesByCell(columns);
    this.totalCalculator = new TotalCalculator(this.tableConfig, this.valuesByCell);
    this.rowsToDescriptions = {};

    const rows = await this.buildRows();
    const data = { columns, rows, period };

    return this.buildFromExtraConfig(data);
  }

  /** 
   * Add `key` to each cell to match the config of `TableOfCalculatedValues` data builder
   * 
   * Example of config of `TableOfCalculatedValues` data builder
   * 
   * ----------------------------------------------------------
   *  {
        "key": "Lao_Language_Textbook_Student_Ratio_G1",
        "operands": [
          {
            "dataValues": [
              "STCL001"
            ]
          },
          {
            "dataValues": [
              "SchPop011",
              "SchPop012"
            ]
          }
        ],
        "operator": "DIVIDE"
      }
   * ----------------------------------------------------------
   * */
  async buildValuesByCell(columns) {
    const hierarchyId = await this.fetchEntityHierarchyId();
    this.tableConfig.cells.forEach((cell, rowKey) => {
      this.tableConfig.cells[rowKey] = columns.map(({ key: columnKey, title }) => ({
        key: `row${rowKey}_${columnKey}`,
        organisationUnit: title,
        ...cell[0],
      }));
    });

    return getCalculatedValuesByCell(this.models, flatten(this.tableConfig.cells), this.results, {
      hierarchyId,
      filterOptions: ['organisationUnit', 'dataElement'],
    });
  }

  buildBaseRows(rows = this.tableConfig.rows, parent = undefined, baseCellIndex = 0) {
    return buildBaseRowsForOrgUnit(rows, parent, baseCellIndex, this.config);
  }
}

export const tableOfCalculatedValuesForOrgUnits = async (
  { models, dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const builder = new TableOfCalculatedValuesForOrgUnitsBuilder(
    models,
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
  );

  let result = await builder.build();
  if (dataBuilderConfig.columnSummary) {
    result = buildColumnSummary(result, dataBuilderConfig.columnSummary);
  }
  if (dataBuilderConfig.rowSummary) {
    result = buildRowSummary(result, dataBuilderConfig.rowSummary);
  }
  return result;
};
