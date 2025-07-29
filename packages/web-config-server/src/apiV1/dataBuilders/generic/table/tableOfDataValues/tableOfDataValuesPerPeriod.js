import { groupAnalyticsByPeriod } from '@tupaia/dhis-api';
import { parsePeriodType, periodToDisplayString, getPeriodsInRange } from '@tupaia/utils';
import { flatten } from 'es-toolkit/compat';
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

    // Only support for 1 period column at the moment
    if (typeof columns === 'object' && columns.type === '$period') {
      const { periodType, name, fillEmptyPeriods } = columns;
      const parsedPeriodType = parsePeriodType(periodType);
      const periodColumns = this.getPeriodColumns(fillEmptyPeriods, parsedPeriodType);

      periodColumns.forEach(period => {
        const periodDisplayString = periodToDisplayString(period, parsedPeriodType);

        tableColumns.push({
          key: period,
          title: name ? `${name}, ${periodDisplayString}` : periodDisplayString,
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
    const dataElementCodes = flatten(this.config.cells)
      .map(cell => (typeof cell === 'object' ? cell.dataElement : cell))
      .filter(e => e !== 'NONE');

    return [...new Set(dataElementCodes)];
  }

  getDataElementToRowConfig() {
    const dataElementToRowConfig = {};

    if (this.config.baselineColumns) {
      this.config.baselineColumns.forEach(baselineColumn => {
        const { dataElements } = baselineColumn;
        dataElements.forEach((dataElement, index) => {
          dataElementToRowConfig[dataElement] = {
            rowName: this.tableConfig.rows[index],
            calculationType: 'SUM',
          };
        });
      });
    }

    this.tableConfig.cells.forEach((cellArray, index) => {
      cellArray.forEach(cell => {
        const { calc = 'SUM' } = cell;
        const dataElement = typeof cell === 'object' ? cell.dataElement : cell;
        dataElementToRowConfig[dataElement] = {
          rowName: this.tableConfig.rows[index],
          calculationType: calc,
        };
      });
    });

    return dataElementToRowConfig;
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
    const dataElementToRowConfig = this.getDataElementToRowConfig();
    const { columns: configColumns } = this.config;
    let rowData = { ...baseRows };

    rowData = this.populateBaselineDataForRows(rowData, dataElementToRowConfig);

    // Only support for 1 period column at the moment
    if (typeof configColumns === 'object' && configColumns.type === '$period') {
      const { periodType } = configColumns;
      const parsedPeriodType = parsePeriodType(periodType);
      const groupedAnalyticsByPeriod = groupAnalyticsByPeriod(this.results, parsedPeriodType);
      columns.forEach(({ key }) => {
        const analytics = groupedAnalyticsByPeriod[key];

        if (analytics) {
          analytics.forEach(analytic => {
            const { dataElement, value } = analytic;
            const { rowName, calculationType } = dataElementToRowConfig[dataElement];
            if (calculationType === 'SUM') {
              rowData[rowName][key] = (rowData[rowName][key] || 0) + value;
            } else {
              throw new Error(`Calculation type ${calculationType} not defined`);
            }
          });

          // Handle NONE dataElement row.
          if (dataElementToRowConfig.NONE) {
            const { rowName, calculationType } = dataElementToRowConfig.NONE;
            if (calculationType === 'COUNT_ENTITIES_IN_ANALYTICS') {
              // Hack to avoid using getDataValuesInSets and fetching SurveyDate,
              // which would be the number of survey responses submitted.
              rowData[rowName][key] = analytics.reduce(
                ([entityCount, entitiesSeen], analytic) => {
                  const { organisationUnit } = analytic;
                  return entitiesSeen.includes(organisationUnit)
                    ? [entityCount, entitiesSeen]
                    : [entityCount + 1, [...entitiesSeen, organisationUnit]];
                },
                [0, []],
              )[0];
            } else {
              throw new Error(`Calculation type ${calculationType} not defined`);
            }
          }
        }
      });
    }

    return Object.values(rowData);
  }

  populateBaselineDataForRows(rowData, dataElementToRowConfig) {
    const newRowData = rowData;

    if (this.config.baselineColumns) {
      this.config.baselineColumns.forEach(baselineColumn => {
        const { name } = baselineColumn;

        this.baselineResults.forEach(baselineAnalytic => {
          const { dataElement, value } = baselineAnalytic;
          const { rowName } = dataElementToRowConfig[dataElement];
          newRowData[rowName][name] = value;
        });
      });
    }

    return newRowData;
  }
}

export const tableOfValuesPerPeriod = async (
  { models, dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const builder = new TableOfValuesPerPeriodBuilder(
    models,
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    dataBuilderConfig.columns.aggregationType, // columns is mandatory in the config of this dataBuilder
  );
  return builder.build();
};
