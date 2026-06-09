import { QUERY_CONJUNCTIONS } from '@tupaia/database';
import { ValidationError } from '@tupaia/utils';

const { AND, OR } = QUERY_CONJUNCTIONS;

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

  async getCountryIdByCountryCode(countryCode) {
    const country = await this.models.country.findOne({ code: countryCode });
    return country.id;
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
   * @param countryId
   * @returns {Promise<variables>}
   */
  async getVariablesByEntityIds(entityIds, countryId) {
    let country;
    let newCountryId = countryId;
    const entitiesArray = Array.isArray(entityIds) ? entityIds : entityIds.split(',');
    const entities = await Promise.all(
      entitiesArray.map(entityId => this.models.entity.findById(entityId)),
    );
    if (!countryId && entities.length > 0) {
      const countryCodeFromEntity = entities[0].country_code;
      country = await this.models.country.findOne({ code: countryCodeFromEntity });
      newCountryId = country.id;
    }
    return { country, countryId: newCountryId, entities };
  }

  async getVariablesBySurveyResponseId(surveyResponseId) {
    const surveyResponse = await this.models.surveyResponse.findById(surveyResponseId);
    const surveyId = surveyResponse.survey_id;
    const country = await surveyResponse.country();
    const entities = await this.models.entity.find({ id: surveyResponse.entity_id });
    return { surveyResponse, surveyId, country, entities };
  }

  async getSurveys(surveyId, surveyCodes, countryId) {
    const isEnabledInCountryFilter = countryId
      ? {
          country_ids: '{}', // empty country_ids means enabled in all countries
          [OR]: {
            country_ids: { comparator: '@>', comparisonValue: [countryId] },
          },
        }
      : { country_ids: '{}' };

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
        surveyFindConditions[AND] = isEnabledInCountryFilter;
      }
      surveys = await this.models.survey.find(surveyFindConditions);
    } else {
      // No specific surveyId passed in, so export all surveys that apply to this country
      surveys = await this.models.survey.find(isEnabledInCountryFilter);
    }
    if (!surveys || surveys.length < 1) {
      throw new ValidationError('Survey not found. Please check permissions');
    }

    return surveys;
  }

  async getParametersFromInput(countryCode, entityCode, countryId, entityIds, surveyResponseId) {
    const newCountryId =
      (countryCode && (await this.getCountryIdByCountryCode(countryCode))) || countryId;
    if (entityCode) return this.getVariablesByEntityCode(entityCode);
    if (newCountryId) return this.getVariablesByCountryId(newCountryId);
    if (entityIds) return this.getVariablesByEntityIds(entityIds, newCountryId);
    if (surveyResponseId) return this.getVariablesBySurveyResponseId(surveyResponseId);
    throw new ValidationError(
      'Please specify either surveyResponseId, countryId, countryCode, facilityCode or entityIds',
    );
  }
}
