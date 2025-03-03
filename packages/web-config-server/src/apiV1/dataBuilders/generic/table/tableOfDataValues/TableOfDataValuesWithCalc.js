import moment from 'moment';

import { CustomError } from '@tupaia/utils';
import { TableOfDataValuesBuilder } from './tableOfDataValues';
import { TableConfig } from './TableConfig';
import { getValuesByCell } from './helpers/getValuesByCell';

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

    const hasBaseLineData = baseLine.length > 0;

    const baseLineDate = hasBaseLineData && moment(baseLine[0].period, 'YYYYMMDD');
    this.transformConfig(baseLineDate);
    this.tableConfig = new TableConfig(this.models, this.config, baseLine);
    this.valuesByCell = getValuesByCell(this.tableConfig, baseLine);

    const data = {
      rows: await this.buildRows(),
      columns: await this.buildColumns(),
    };
    if (this.tableConfig.hasRowCategories()) {
      const categories = await this.buildRowCategories();
      data.rows = [...data.rows, ...categories];
    }

    return data;
  }

  transformResults(rawData) {
    const dataElementCodes = [];

    this.config.cells.forEach(row => {
      row.forEach(cell => {
        if (cell.action) {
          const rawTransformData = rawData.filter(e => cell.dataValues.includes(e.dataElement));
          if (rawTransformData.length > 0) {
            const transformData = rawTransformData.map(x =>
              this.formatSingleValue(rawData, x.dataElement),
            );
            try {
              dataElementCodes.push(TRANSFORMATIONS[cell.action](transformData));
            } catch (error) {
              throw new CustomError({
                type: 'Transformation not found',
                description: `Transformation not found ${cell.action} not found`,
              });
            }
          }
        } else if (rawData.some(e => e.dataElement === cell)) {
          dataElementCodes.push(this.formatSingleValue(rawData, cell));
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

  transformConfig(baseLineDate) {
    this.config.cells = this.config.cells.map(row => {
      return row.map(cell => {
        return cell.dataElement ? cell.dataElement : cell;
      });
    });

    this.config.columns = this.config.columns.map(header => {
      return header.name && header.showYear
        ? `${header.name}${baseLineDate ? ` - ${baseLineDate.format('YYYY')}` : ''}`
        : header;
    });
  }

  async fetchResults() {
    const results = await this.dhisApi.getDataValuesInSets(
      {
        dataElementGroupCode: this.config.dataElementGroupCode,
        startDate: this.config.MinBaseLine,
        endDate: this.config.MaxBaseLine,
      },
      this.entity,
    );
    return this.transformResults(results);
  }
}

export const tableOfDataValuesWithCalc = async (
  { models, dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const builder = new TableOfDataValuesWithCalcBuilder(
    models,
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
  );
  return builder.build();
};
