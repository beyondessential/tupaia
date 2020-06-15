import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

import { buildExportUrl } from '/export';

import { Question, Survey, Entity, Country } from '/models';

import { reduceToDictionary } from '@tupaia/utils';

import moment from 'moment';

const RAW_VALUE_DATE_FORMAT = 'D-M-YYYY h:mma';

class RawDataValuesBuilder extends DataBuilder {
  async build() {
    const surveyCodes = this.query.surveyCodes;
    if (!surveyCodes) {
      return this.getSurveyExportOptions();
    }

    const data = await this.fetchResults(surveyCodes);
    return { data };
  }

  getSurveyExportOptions() {
    const { surveys } = this.config;

    return {
      data: surveys.map(({ name, code }) => ({
        name,
        value: code,
      })),
      downloadUrl: buildExportUrl(this.req, 'rawDataSurveyResponses', {
        ...this.query,
      }),
    };
  }

  async fetchResults(surveyCodes) {
    const surveys = await this.findSurveys(surveyCodes);

    const data = {};

    if (!surveys.length) {
      return data;
    }

    //Loop through each selected survey and fetch the analytics of that survey,
    //then build a matrix around the analytics
    for (let surveyIndex = 0; surveyIndex < surveys.length; surveyIndex++) {
      const survey = surveys[surveyIndex];
      const questions = await Question.findQuestionsBySurvey({ survey_id: survey.id });

      if (!questions.length) {
        continue;
      }

      const questionCodes = questions.map(question => question.code);
      const questionCodeToText = {};

      questions.forEach(question => {
        questionCodeToText[question.code] = question.text;
      });

      const analyticResults = await this.fetchAnalytics(questionCodes);
      const columns = this.buildColumns(analyticResults.results);

      let rows = [];

      if (columns && columns.length) {
        rows = await this.buildRows(analyticResults.results, questionCodeToText, questionCodes);
      }

      data[survey.name] = {
        data: {
          columns,
          rows,
        },
      };
    }

    return data;
  }

  async findSurveys(surveyCodes) {
    const country = await Country.findOne({ code: this.entity.country_code });
    return Survey.find({
      code: {
        comparisonType: 'whereIn',
        args: Array.isArray(surveyCodes) ? [surveyCodes] : [surveyCodes.split(',')],
      },
      _and_: {
        country_ids: '{}',
        _or_: {
          country_ids: { comparator: '@>', comparisonValue: [country.id] },
        },
      },
    });
  }

  getEntityCodeToName = async analytics => {
    const entityCodes = analytics.map(analytic => analytic.organisationUnit);

    const entities = await Entity.find({
      code: {
        comparisonType: 'whereIn',
        args: [entityCodes],
      },
    });

    return reduceToDictionary(entities, 'code', 'name');
  };

  /**
   * Build columns for each organisationUnit - period combination
   */
  buildColumns = analytics => {
    const builtColumnsMap = {};

    analytics.forEach(({ organisationUnit, period }) => {
      const key = `${organisationUnit}|${period}`;
      builtColumnsMap[key] = {
        key: key,
        title: key,
      };
    });

    return Object.values(builtColumnsMap);
  };

  /**
   * Build row values for data elements of different organisationUnit - period combination
   */
  async buildRows(analytics, dataElementCodeToText) {
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

    const entityCodeToName = await this.getEntityCodeToName(analytics);

    //Loop through each data key and build a row for each organisationUnit - period combination
    Object.entries(dataKeyToName).forEach(([dataKey, text]) => {
      //First column is the name of the data element
      const row = {
        dataElement: text,
      };

      //Build a row for each organisationUnit - period combination
      analytics.forEach(analytic => {
        if (dataKey === analytic.dataElement || DEFAULT_DATA_KEY_TO_TEXT[dataKey]) {
          const key = `${analytic.organisationUnit}|${analytic.period}`;
          const value = this.getValueFromDataKey(analytic, dataKey, entityCodeToName);
          row[key] = value;
        }
      });

      builtRows.push(row);
    });

    return builtRows;
  }

  getValueFromDataKey = (analytic, dataKey, entityCodeToName) => {
    switch (dataKey) {
      case 'name':
        return entityCodeToName[analytic.organisationUnit];
      case 'entityCode':
        return analytic.organisationUnit;
      case 'date':
        return moment(analytic.period).format(RAW_VALUE_DATE_FORMAT);
      default:
        return analytic.value;
    }
  };

  injectReq(req) {
    this.req = req;
  }
}

export const rawDataValues = async (
  { dataBuilderConfig, query, entity, req },
  aggregator,
  dhisApi,
) => {
  const builder = new RawDataValuesBuilder(
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    aggregator.aggregationTypes.RAW_DATA,
  );

  builder.injectReq(req);

  return builder.build();
};
