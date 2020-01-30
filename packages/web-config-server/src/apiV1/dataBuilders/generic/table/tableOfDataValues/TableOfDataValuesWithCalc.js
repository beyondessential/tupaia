/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import moment from 'moment';

import { TableOfDataValuesBuilder } from './tableOfDataValues';
import { TableConfig } from './TableConfig';
import { getValuesByCell } from './getValuesByCell';

const add = async transformResults => {
  return transformResults.reduce(
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
};

const naOnBlank = async transformElement => {
  return transformElement.reduce(
    (accumulator, current) => {
      return {
        dataElement: current.dataElement,
        organisationUnit: current.organisationUnit,
        period: current.period,
        value: current.value ? current.value : 'N/A',
      };
    },
    { value: 0 },
  );
};

const TRANSFORMATIONS = {
  SUM: add,
  NA: naOnBlank,
};

class TableOfDataValuesWithCalcBuilder extends TableOfDataValuesBuilder {
  async build() {
    const baseLine = await this.fetchResults();
    const baseLineDate = moment(baseLine[0].period, 'YYYYMMDD');
    await this.transformConfig(baseLine);
    console.log(baseLine);
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

  async transformConfig(baseLine) {
    this.config.cells = this.config.cells.map(arrItem => {
      return arrItem.map(objItem => {
        return objItem.dataElement;
      });
    });
  }

  async fetchResults() {
    const dataElements = {
      dataElementGroupCode: this.config.dataElementGroupCode,
      startDate: this.config.MinBaseLine,
      endDate: this.config.MaxBaseLine,
      organisationUnitCode: [this.entity.code],
    };

    return this.dhisApi.getDataValuesInSets(dataElements);
  }
}

export const TableOfDataValuesWithCalc = async ({ dataBuilderConfig, query, entity }, dhisApi) => {
  const builder = new TableOfDataValuesWithCalcBuilder(dhisApi, dataBuilderConfig, query, entity);
  return builder.build();
};
