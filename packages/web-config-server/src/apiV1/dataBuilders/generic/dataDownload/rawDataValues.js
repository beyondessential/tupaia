import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

import { reduceToDictionary } from '@tupaia/utils';

import moment from 'moment';

const RAW_VALUE_DATE_FORMAT = 'D-M-YYYY h:mma';

class RawDataValuesBuilder extends DataBuilder {
  async build() {
    const surveyCodes = this.query.surveyCodes;
    const data = await this.fetchResults(surveyCodes.split(','));
    return { data };
  }

  async fetchResults(surveyCodes) {
    const data = {};

    const surveyCodeToName = reduceToDictionary(this.config.surveys, 'code', 'name');

    const { surveysConfig = {} } = this.config;

    //Loop through each selected survey and fetch the analytics of that survey,
    //then build a matrix around the analytics
    for (let surveyCodeIndex = 0; surveyCodeIndex < surveyCodes.length; surveyCodeIndex++) {
      const surveyCode = surveyCodes[surveyCodeIndex];
      const { dataElements: dataElementsMetadata } = await this.fetchDataGroup(surveyCode);
      const dataElementCodes = dataElementsMetadata.map(d => d.code);
      const surveyConfig = surveysConfig[surveyCode];
      let additionalQueryConfig = { dataElementCodes };

      if (surveyConfig) {
        const { entityAggregation } = surveyConfig;
        additionalQueryConfig = {
          ...additionalQueryConfig,
          entityAggregation,
        };
      }

      const events = await this.fetchEvents(additionalQueryConfig, surveyCode);

      const columns = this.buildColumns(events);

      const dataElementCodeToText = reduceToDictionary(dataElementsMetadata, 'code', 'text');

      let rows = [];

      if (columns && columns.length) {
        rows = await this.buildRows(events, dataElementCodeToText);
      }

      data[surveyCodeToName[surveyCode]] = {
        // need the nested 'data' property to be interpreted as the input to a matrix
        data: {
          columns,
          rows,
        },
      };
    }

    return data;
  }

  /**
   * Build columns for each organisationUnit - period combination
   */
  buildColumns = events => {
    const builtColumnsMap = {};

    events.forEach(({ event }) => {
      //event = id of survey_response
      builtColumnsMap[event] = {
        key: event,
        title: event,
      };
    });

    return Object.values(builtColumnsMap);
  };

  /**
   * Build row values for data elements of different organisationUnit - period combination
   */
  buildRows = async (events, dataElementCodeToText) => {
    const builtRows = [];

    const DEFAULT_DATA_KEY_TO_TEXT = {
      entityCode: 'Entity Code',
      name: 'Name',
      date: 'Date',
    };

    const dataKeyToName = {
      ...DEFAULT_DATA_KEY_TO_TEXT,
      ...dataElementCodeToText,
    };

    //Loop through each data key and build a row for each organisationUnit - period combination
    Object.entries(dataKeyToName).forEach(([dataKey, text]) => {
      //First column is the name of the data element
      const row = {
        dataElement: text,
      };

      //Build a row for each organisationUnit - period combination
      events.forEach(({ event, orgUnit, orgUnitName, eventDate, dataValues }) => {
        Object.entries(dataValues).forEach(([code, dataValue]) => {
          if (dataKey === code || DEFAULT_DATA_KEY_TO_TEXT[dataKey]) {
            let value;

            switch (dataKey) {
              case 'name':
                value = orgUnitName;
                break;
              case 'entityCode':
                value = orgUnit;
                break;
              case 'date':
                value = moment(eventDate).format(RAW_VALUE_DATE_FORMAT);
                break;
              default:
                value = dataValue;
                break;
            }

            row[event] = value;
          }
        });
      });

      builtRows.push(row);
    });

    return builtRows;
  };
}

export const rawDataValues = async ({ dataBuilderConfig, query, entity }, aggregator, dhisApi) => {
  const builder = new RawDataValuesBuilder(
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    aggregator.aggregationTypes.RAW_DATA,
  );

  return builder.build();
};
