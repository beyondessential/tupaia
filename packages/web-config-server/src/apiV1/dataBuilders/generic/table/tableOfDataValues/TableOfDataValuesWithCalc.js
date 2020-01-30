/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import moment from 'moment';

import { TableOfDataValuesBuilder } from './tableOfDataValues';
import { TableConfig } from './TableConfig';
import { getValuesByCell } from './getValuesByCell';

const add = transformResults => {
  return transformResults.reduce(
    (accumulator, current) => {
      return {
        dataElement: current.dataElement,
        organisationUnit: current.organisationUnit,
        period: current.period,
        value: Number.parseInt(accumulator.value, 10) + Number.parseInt(current.value, 10),
      };
    },
    { value: 0 },
  );
};

const TRANSFORMATIONS = {
  SUM: add,
};

class TableOfDataValuesWithCalcBuilder extends TableOfDataValuesBuilder {
  async build() {
    const baseLine = await this.fetchResults();
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

  transformResults(rawData) {
    const dataElementCodes = [];

    this.config.cells.forEach(arrayItem => {
      arrayItem.forEach(arrItem => {
        if (arrItem.action) {
          const rawTransformData = rawData.filter(e => arrItem.dataValues.includes(e.dataElement));
          if (rawTransformData.length > 0) {
            const transformData = rawTransformData.map(x =>
              this.formatSingleValue(rawData, x.dataElement),
            );
            dataElementCodes.push(TRANSFORMATIONS[arrItem.action](transformData));
          }
        } else if (rawData.some(e => e.dataElement === arrItem.dataElement)) {
          dataElementCodes.push(this.formatSingleValue(rawData, arrItem.dataElement));
        }
      });
    });
    return dataElementCodes;
  }

  formatSingleValue(rawData, dataElementKey) {
    return {
      dataElement: dataElementKey,
      organisationUnit: this.entity.code,
      period: rawData.find(e => e.dataElement === dataElementKey).period,
      value: rawData.find(e => e.dataElement === dataElementKey).value,
    };
  }

  async transformConfig() {
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

    const results = await this.dhisApi.getDataValuesInSets(dataElements);
    return this.transformResults(results);
  }
}

export const TableOfDataValuesWithCalc = async ({ dataBuilderConfig, query, entity }, dhisApi) => {
  const builder = new TableOfDataValuesWithCalcBuilder(dhisApi, dataBuilderConfig, query, entity);
  return builder.build();
};
