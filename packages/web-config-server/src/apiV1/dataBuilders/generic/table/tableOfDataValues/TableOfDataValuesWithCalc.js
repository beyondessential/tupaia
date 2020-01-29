/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import flatten from 'lodash.flatten';
import moment from 'moment';

import { TableOfDataValuesBuilder } from './tableOfDataValues';
import { TableConfig } from './TableConfig';
import { getValuesByCell } from './getValuesByCell';

class TableOfDataValuesWithCalcBuilder extends TableOfDataValuesBuilder {
  async build() {
    await this.buildBaseLineQuery();
    const baseLine = await this.fetchResultsHeader();
    const baseLineDate = moment(baseLine[0].period, 'YYYYMMDD');
    await this.transformConfig();
    this.tableConfig = new TableConfig(this.config, baseLine);
    this.tableConfig.columns[0] = `Base Line - ${baseLineDate.format('YYYY')}`;
    this.valuesByCell = getValuesByCell(this.tableConfig, baseLine);

    const data = {
      rows: await this.buildRows(),
      columns: await this.buildColumns(),
    };
    if (this.tableConfig.hasRowCategories()) {
      data.categories = await this.buildRowCategories();
    }

    return data;
  }

  async transformConfig() {
    this.config.cells = this.config.cells.map(arrItem => {
      return arrItem.map(objItem => {
        return objItem.dataElement;
      });
    });
  }

  async fetchResultsHeader() {
    const dataElementCodes = [];
    const transformElementCodes = [];

    this.config.cells.forEach(arrayItem => {
      arrayItem.forEach(arrItem => {
        if (arrItem.action) transformElementCodes.push(...new Set(flatten(arrItem.dataValues)));
        else dataElementCodes.push(arrItem.dataElement);
      });
    });

    const transformResults = await this.fetchResults(transformElementCodes);
    const results = await this.fetchResults(dataElementCodes);

    const sumResults = transformResults.reduce(
      (accumulator, current) => {
        return {
          dataElement: current.dataElement,
          organisationUnit: current.organisationUnit,
          period: current.period,
          value: accumulator.value + current.value,
        };
      },
      { value: 0 },
    );

    return [sumResults, ...results];
  }

  async fetchResults(dataElementCodes) {
    const { results } = await this.getAnalytics({ dataElementCodes, outputIdScheme: 'code' });
    return results;
  }

  async buildBaseLineQuery() {
    const startDate = moment(this.config.MinBaseLine, 'YYYYMMDD');
    const endDate = moment(this.config.MaxBaseLine, 'YYYYMMDD');

    this.query.period = '';

    while (startDate.isBefore(endDate)) {
      this.query.period += `${startDate.format('YYYYMM')};`;
      startDate.add(1, 'month');
    }
  }
}

export const TableOfDataValuesWithCalc = async ({ dataBuilderConfig, query, entity }, dhisApi) => {
  const builder = new TableOfDataValuesWithCalcBuilder(dhisApi, dataBuilderConfig, query, entity);
  return builder.build();
};
