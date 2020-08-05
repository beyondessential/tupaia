import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

import { reduceToDictionary } from '@tupaia/utils';
import { transposeMatrix, mergeTableDataOnKey } from '/apiV1/utils';

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
    const { transformations = [] } = this.config;
    let transformableData = await this.fetchResults(surveyCodes.split(','));

    if (transformations.includes('mergeSurveys')) {
      const mergedTableName = this.config.surveys[0].name;
      transformableData = mergeTableDataOnKey(transformableData, mergedTableName);
    }

    if (transformations.includes('transposeMatrix')) {
      Object.entries(transformableData).forEach(([key, value]) => {
        transformableData[key].data = transposeMatrix(value.data, ROW_HEADER_KEY);
      });
    }
    return { data: transformableData };
  }

  async fetchResults(surveyCodes) {
    const builtData = {};

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

      const rawEvents = await this.fetchEvents(additionalQueryConfig, surveyCode);

      // Optional sorting config
      const mergeRowKey = surveyConfig.mergeRowKey;
      const ancestorTypeForSort =
        this.config.ancestorSortConfig && this.config.ancestorSortConfig.type;

      const sortedEvents = await this.sortEvents(rawEvents, { mergeRowKey, ancestorTypeForSort });

      const sortedMappedEvents = mergeRowKey
        ? sortedEvents.map(e => ({
            ...e,
            mergeCompareValue: e.dataValues[mergeRowKey],
          }))
        : sortedEvents;

      const columns = this.buildColumns(sortedMappedEvents);

      const dataElementCodeToText = reduceToDictionary(dataElementsMetadata, 'code', 'text');

      const rows = await this.buildRows(sortedMappedEvents, dataElementCodeToText);

      const data = {
        columns,
        rows,
      };
      const { skipHeader = true } = this.config;

      builtData[surveyCodeToName[surveyCode]] = {
        // need the nested 'data' property to be interpreted as the input to a matrix
        data,
        skipHeader,
      };
    }
    return builtData;
  }

  sortEvents = async (events, sortKeys) => {
    if (!sortKeys) return events;

    // If we are merging sorting on that key takes precedence
    // for performance of merge and avoid ancestor lookup
    if (sortKeys.mergeRowKey) return this.sortEventsByDataValue(events, sortKeys.mergeRowKey);

    if (sortKeys.ancestorTypeForSort) return this.sortEventsByAncestor(events, sortKeys.ancestorTypeForSort);

    //default unsorted
    return events;
  };

  /**
   * Build columns for each organisationUnit - period combination
   */
  buildColumns = events => {
    const builtColumnsMap = {};

    events.forEach(({ event, mergeCompareValue }) => {
      //event = id of survey_response
      //mergeCompareValue = optional dataValue to merge tables
      builtColumnsMap[event] = {
        key: event,
        title: event,
        ...(mergeCompareValue ? { mergeCompareValue } : {}),
      };
    });

    return Object.values(builtColumnsMap);
  };

  /**
   * Build row values for data elements of different organisationUnit - period combination
   */
  buildRows = async (events, dataElementCodeToText) => {
    const builtRows = [];

    const ancestorRow =
      this.config.ancestorSortConfig && this.config.ancestorSortConfig.showInExport
        ? { ancestor: this.config.ancestorSortConfig.type }
        : {};

    const DEFAULT_DATA_KEY_TO_TEXT = {
      entityCode: 'Entity Code',
      name: 'Name',
      date: 'Date',
      ...ancestorRow, // may be undefined, in which case we don't include the ancestor in the metadata rows
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
      events.forEach(({ event, orgUnit, orgUnitName, eventDate, dataValues, orgUnitAncestor }) => {
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
              case 'ancestor':
                value = orgUnitAncestor;
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
