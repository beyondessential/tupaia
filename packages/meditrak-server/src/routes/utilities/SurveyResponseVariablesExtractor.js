/**
 * Tupaia MediTrak
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import { ValidationError } from '@tupaia/utils';

/**
 * A function that extracts `country`, `countryId`, 'entities', 'surveyResponse' and 'surveys' from a database
 *
 */

export class SurveyResponseVariablesExtractor {
  /**
   * @param {ModelRegistry} models
   */
  constructor(models) {
    this.models = models;
  }

  async getVariablesByCountryCode(countryCode) {
    const country = await this.models.country.findOne({ code: countryCode });
    return { country, countryId: country.id };
  }

  async getVariablesByEntityCode(entityCode) {
    const entity = await this.models.entity.findOne({ code: entityCode });
    const country = await this.models.country.findOne({ code: entity.country_code });
    return { country, entities: [entity] };
  }

  async getVariablesByCountryId(countryId) {
    const country = await this.models.country.findById(countryId);
    const entities = await this.models.entity.find(
      { country_code: country.code },
      { sort: ['name ASC'] },
    );
    return { country, entities };
  }

  /**
   * @typedef {string, string, Array | Array} variables
   *
   * @param entityIds
   * @returns {Promise<variables>}
   */
  async getVariablesByEntityIds(entityIds) {
    let country;
    let countryId;
    const entities = await Promise.all(
      entityIds.split(',').map(entityId => this.models.entity.findById(entityId)),
    );
    if (!countryId && entities.length > 0) {
      const countryCodeFromEntity = entities[0].country_code;
      country = await this.models.country.findOne({ code: countryCodeFromEntity });
      countryId = country.id;
    }
    return { country, countryId, entities };
  }

  async getVariablesBySurveyResponseId(surveyResponseId) {
    const surveyResponse = await this.models.surveyResponse.findById(surveyResponseId);
    const surveyId = surveyResponse.survey_id;
    const country = await surveyResponse.country();
    return { surveyResponse, surveyId, country };
  }

  async getSurveys(surveyId, surveyCodes, countryId) {
    let surveys;
    if (surveyId) {
      // A surveyId of interest passed in, only export that
      surveys = [await this.models.survey.findById(surveyId)];
    } else if (surveyCodes) {
      const surveyFindConditions = {
        // surveyCodes may be passed through as a comma separated string or as an array, which looks like this in a query:
        // ?surveyCodes=code1&surveyCodes=code2
        code: {
          comparisonType: 'whereIn',
          args: Array.isArray(surveyCodes) ? [surveyCodes] : [surveyCodes.split(',')],
        },
      };
      if (countryId) {
        // Fetch surveys where country_ids is empty (enabled in all countries) or contains countryId
        // eslint-disable-next-line no-underscore-dangle
        surveyFindConditions._and_ = {
          country_ids: '{}',
          _or_: {
            country_ids: { comparator: '@>', comparisonValue: [countryId] },
          },
        };
      }
      surveys = await this.models.survey.find(surveyFindConditions);
    } else {
      // No specific surveyId passed in, so export all surveys that apply to this country
      const allSurveys = await this.models.survey.all();
      surveys = allSurveys.filter(
        survey => survey.country_ids.length === 0 || survey.country_ids.includes(countryId),
      );
    }
    if (!surveys || surveys.length < 1) {
      throw new ValidationError('Survey not found. Please check permissions');
    }

    return surveys;
  }

  async getParametersFromInput(countryCode, entityCode, countryId, entityIds, surveyResponseId) {
    let country;
    let entities;
    let surveyId;
    let surveyResponse;
    if (countryCode) {
      const variables = await this.getVariablesByCountryCode(countryCode);
      country = variables.country;
      countryId = variables.countryId;
    }

    if (entityCode) {
      const variables = await this.getVariablesByEntityCode(entityCode);
      country = variables.country;
      entities = variables.entities;
    } else if (countryId) {
      const variables = await this.getVariablesByCountryId(countryId);
      country = variables.country;
      entities = variables.entities;
    } else if (entityIds) {
      const variables = await this.getVariablesByEntityIds(entityIds);
      country = variables.country;
      countryId = variables.countryId;
      entities = variables.entities;
    } else if (surveyResponseId) {
      const variables = await this.getVariablesBySurveyResponseId(surveyResponseId);
      country = variables.country;
      surveyId = variables.surveyId;
      surveyResponse = variables.surveyResponse;
    } else {
      throw new ValidationError(
        'Please specify either surveyResponseId, countryId, countryCode, facilityCode or entityIds',
      );
    }

    return { country, entities, countryId, surveyId, surveyResponse };
  }
}
