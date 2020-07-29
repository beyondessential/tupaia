import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

import { reduceToDictionary } from '@tupaia/utils';
import { transposeMatrix, mergeSurveys } from '/apiV1/utils';

import moment from 'moment';
import flatten from 'lodash.flatten';

const RAW_VALUE_DATE_FORMAT = 'D-M-YYYY h:mma';
const ROW_HEADER_KEY = 'dataElement'; // row headers live under the key 'dataElement' for historical reasons
const expandSurveyCodes = surveys => {
  return flatten(
    surveys.map(survey => {
      return survey.codes
        ? survey.codes.map(code => ({
            code: code,
            name: `${code}-${survey.name}`,
          }))
        : survey;
    }),
  );
};

class RawDataValuesBuilder extends DataBuilder {
  async build() {
    const surveyCodes = this.query.surveyCodes;
    let transformableData = await this.fetchResults(surveyCodes.split(','));

    if (this.config.transformations && this.config.transformations.includes('mergeSurveys')) {
      transformableData = mergeSurveys(transformableData);
    }

    if (this.config.transformations && this.config.transformations.includes('transposeMatrix')) {
      Object.entries(transformableData).forEach(([key, value]) => {
        transformableData[key].data = transposeMatrix(value.data, ROW_HEADER_KEY);
      });
    }
    return { data: transformableData };
  }

  async fetchResults(surveyCodes) {
    const buildData = {};

    const surveyCodeToName = reduceToDictionary(
      expandSurveyCodes(this.config.surveys),
      'code',
      'name',
    );

    const { surveysConfig = {} } = this.config;

    //Loop through each selected survey and fetch the analytics of that survey,
    //then build a matrix around the analytics
    for (let surveyCodeIndex = 0; surveyCodeIndex < surveyCodes.length; surveyCodeIndex++) {
      const surveyCode = surveyCodes[surveyCodeIndex];
      const { dataElements: dataElementsMetadata } = await this.fetchDataGroup(surveyCode);
      const surveyConfig = surveysConfig[surveyCode];

      const dataElementCodes = dataElementsMetadata.map(d => d.code);
      let additionalQueryConfig = { dataElementCodes };

      if (surveyConfig) {
        const { excludeCodes = [] } = surveyConfig;
        if (excludeCodes.length > 0) {
          additionalQueryConfig.dataElementCodes = dataElementCodes.filter(
            code => !excludeCodes.includes(code),
          );
        }
        const { entityAggregation } = surveyConfig;
        additionalQueryConfig = {
          ...additionalQueryConfig,
          entityAggregation,
        };
      }

      const events = await this.fetchEvents(additionalQueryConfig, surveyCode);

      const sortedEvents = this.config.sortByAncestor
        ? await this.sortEventsByAncestor(events, this.config.sortByAncestor)
        : events;

      const builtColumns = this.buildColumns(sortedEvents);

      const dataElementCodeToText = reduceToDictionary(dataElementsMetadata, 'code', 'text');

      const builtRows = await this.buildRows(sortedEvents, dataElementCodeToText);

      const { skipHeader = true } = this.config;

      buildData[surveyCodeToName[surveyCode]] = {
        // need the nested 'data' property to be interpreted as the input to a matrix
        data: {
          columns: builtColumns,
          rows: builtRows,
        },
        skipHeader: skipHeader,
      };
    }
    return buildData;
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
