/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { groupAnalyticsByPeriod } from '@tupaia/dhis-api';
import { parsePeriodType, periodToDisplayString, getPeriodsInRange } from '@tupaia/utils';
import flatten from 'lodash.flatten';
import { TableOfDataValuesBuilder } from './tableOfDataValues';

class TableOfValuesPerPeriodBuilder extends TableOfDataValuesBuilder {
  async fetchAnalyticsAndMetadata() {
    this.baselineResults = await this.fetchBaselineColumnResults();

    return super.fetchAnalyticsAndMetadata();
  }

  async fetchBaselineColumnResults() {
    if (this.config.baselineColumns) {
      const dataElementCodes = flatten(
        this.config.baselineColumns.map(baselineColumn => baselineColumn.dataElements),
      );
      const { results } = await this.fetchAnalytics(dataElementCodes);

      return results;
    }

    return null;
  }

  getPeriodColumns(fillEmptyPeriods, periodType) {
    if (fillEmptyPeriods) {
      const { startDate, endDate } = this.query;
      return getPeriodsInRange(startDate, endDate, periodType);
    }
    const groupAnalytics = groupAnalyticsByPeriod(this.results, periodType);
    return Object.keys(groupAnalytics);
  }

  async buildColumns() {
    let tableColumns = [];
    const { columns, baselineColumns } = this.config;

    if (baselineColumns) {
      tableColumns = tableColumns.concat(this.buildBaselineColumns(baselineColumns));
    }

    //Right now only support for 1 period column
    if (typeof columns === 'object' && columns.type === '$period') {
      const { periodType, name, fillEmptyPeriods } = columns;
      const parsedPeriodType = parsePeriodType(periodType);
      const periodColumns = this.getPeriodColumns(fillEmptyPeriods, parsedPeriodType);

      periodColumns.forEach(period => {
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

  buildBaselineColumns = baselineColumns => {
    return baselineColumns.map(baselineColumn => {
      const { name } = baselineColumn;
      return {
        key: name,
        title: name,
      };
    });
  };

  buildDataElementCodes() {
    const dataElementCodes = flatten(this.config.cells).map(cell =>
      typeof cell === 'object' ? cell.dataElement : cell,
    );

    return [...new Set(dataElementCodes)];
  }

  getDataElementToRowName() {
    const dataElementToRowName = {};

    if (this.config.baselineColumns) {
      this.config.baselineColumns.forEach(baselineColumn => {
        const { dataElements } = baselineColumn;
        dataElements.forEach((dataElement, index) => {
          dataElementToRowName[dataElement] = this.tableConfig.rows[index];
        });
      });
    }

    this.tableConfig.cells.forEach((cellArray, index) => {
      cellArray.forEach(cell => {
        const dataElement = typeof cell === 'object' ? cell.dataElement : cell;
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
    const baseRows = await this.buildBaseRows();
    const { periodType } = this.config.columns;
    const parsedPeriodType = parsePeriodType(periodType);
    const dataElementToRowName = this.getDataElementToRowName();
    const groupedAnalyticsByPeriod = groupAnalyticsByPeriod(this.results, parsedPeriodType);
    let rowData = { ...baseRows };

    rowData = this.populateBaselineDataForRows(rowData, dataElementToRowName);

    columns.forEach(({ key }) => {
      const analytics = groupedAnalyticsByPeriod[key];

      if (analytics) {
        analytics.forEach(analytic => {
          const { dataElement, value } = analytic;
          const rowName = dataElementToRowName[dataElement];
          rowData[rowName][key] = value;
        });
      }
    });

    return Object.values(rowData);
  }

  populateBaselineDataForRows(rowData, dataElementToRowName) {
    const newRowData = rowData;

    if (this.config.baselineColumns) {
      this.config.baselineColumns.forEach(baselineColumn => {
        const { name } = baselineColumn;

        this.baselineResults.forEach(baselineAnalytic => {
          const { dataElement, value } = baselineAnalytic;
          const rowName = dataElementToRowName[dataElement];
          newRowData[rowName][name] = value;
        });
      });
    }

    return newRowData;
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
