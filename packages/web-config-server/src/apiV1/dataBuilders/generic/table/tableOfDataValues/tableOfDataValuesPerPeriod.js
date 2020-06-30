/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { groupAnalyticsByPeriod } from '@tupaia/dhis-api';
import { parsePeriodType, periodToDisplayString } from '@tupaia/utils';
import flatten from 'lodash.flatten';
import { TableOfDataValuesBuilder } from './tableOfDataValues';

class TableOfValuesPerPeriodBuilder extends TableOfDataValuesBuilder {
  async buildColumns() {
    const tableColumns = [];
    const { columns } = this.config;

    if (typeof columns === 'object' && columns.type === '$period') {
      const { periodType, name } = columns;
      const parsedPeriodType = parsePeriodType(periodType);
      const groupAnalytics = groupAnalyticsByPeriod(this.results, parsedPeriodType);
      Object.keys(groupAnalytics).forEach(period => {
        const periodDisplayString = periodToDisplayString(period, parsedPeriodType);

        tableColumns.push({
          key: period,
          title: `${name}, ${periodDisplayString}`,
        });
      });
    }

    this.tableConfig.columns = tableColumns;

    return tableColumns;
  }

  buildDataElementCodes() {
    const dataElementCodes = flatten(this.config.cells).map(cell => {
      return cell.dataElement;
    });

    return [...new Set(dataElementCodes)];
  }

  getDataElementToRowName() {
    const dataElementToRowName = {};

    this.tableConfig.cells.forEach((cellArray, index) => {
      cellArray.forEach(cell => {
        const { dataElement } = cell;
        dataElementToRowName[dataElement] = this.tableConfig.rows[index];
      });
    });

    return dataElementToRowName;
  }

  buildBaseRows(rows = this.tableConfig.rows, parent = undefined) {
    return rows.reduce((baseRows, row) => {
      if (typeof row === 'string') {
        return { ...baseRows, [row]: { dataElement: row, categoryId: parent } };
      }

      const next = this.buildBaseRows(row.rows, row.category);
      return { ...baseRows, ...next };
    }, {});
  }

  async buildRows(columns) {
    console.log('results', this.results);

    const baseRows = await this.buildBaseRows();
    const rowData = { ...baseRows };
    const { periodType } = this.config.columns;
    const parsedPeriodType = parsePeriodType(periodType);
    const dataElementToRowName = this.getDataElementToRowName();
    const groupedAnalyticsByPeriod = groupAnalyticsByPeriod(this.results, parsedPeriodType);

    Object.entries(groupedAnalyticsByPeriod).forEach(([period, analytics]) => {
      const analytic = analytics[0];
      const { dataElement, value } = analytic;
      const rowName = dataElementToRowName[dataElement];
      rowData[rowName][period] = value;
    });

    return Object.values(rowData);
  }
}

export const tableOfValuesPerPeriod = async (
  { dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const builder = new TableOfValuesPerPeriodBuilder(
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
  );
  return builder.build();
};
