import { CustomError } from '@tupaia/utils';

import { getDataElementGroups } from '/apiV1/utils';
import { DATA_SOURCE_TYPES } from './dataSourceTypes';

const { GROUP, SINGLE } = DATA_SOURCE_TYPES;

export class DataElementMapper {
  constructor(dhisApi) {
    this.dhisApi = dhisApi;
  }

  /**
   * @param {Object<string, Object>} dataSources
   * @returns {Object<string, string[]>} A map of data source keys to data element codes
   */
  async getMapFromDataSources(dataSources) {
    const sourcesToDataElements = await this.mapDataSourcesToElements(dataSources);

    const map = {};
    Object.entries(dataSources).forEach(([key, { codes, type }]) => {
      map[key] = [];
      codes.forEach(code => {
        map[key].push(...sourcesToDataElements[type][code]);
      });
    });

    return map;
  }

  /**
   * Returns a map of data sources to data element codes, grouped by source type and element code
   */
  async mapDataSourcesToElements(dataSources) {
    const codesByType = {};
    Object.values(dataSources).forEach(({ codes, type }) => {
      if (!codesByType[type]) {
        codesByType[type] = [];
      }
      codesByType[type].push(...codes);
    });

    const map = {};
    await Promise.all(
      Object.entries(codesByType).map(async ([type, codes]) => {
        map[type] = await this.mapDataSourceCodesToElementCodes(codes, type);
      }),
    );

    return map;
  }

  mapDataSourceCodesToElementCodes = async (codes, dataSourceType) => {
    switch (dataSourceType) {
      case SINGLE: {
        const map = {};
        codes.forEach(code => {
          map[code] = [code];
        });

        return map;
      }
      case GROUP: {
        const dataElementGroups = await getDataElementGroups(this.dhisApi, codes);
        if (!dataElementGroups) {
          throw new CustomError({
            type: 'DHIS Communication error',
            description: 'Data element groups do not exist',
            dataElementGroups: codes,
          });
        }

        const map = {};
        Object.values(dataElementGroups).forEach(({ code, dataElements }) => {
          map[code] = dataElements.map(({ code: dataElementCode }) => dataElementCode);
        });

        return map;
      }
      default:
        throw new Error(`${dataSourceType} is not a supported data source type`);
    }
  };
}
