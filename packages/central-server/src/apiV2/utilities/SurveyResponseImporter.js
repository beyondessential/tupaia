import {
  upsertEntitiesAndOptions,
  validateSurveyResponses,
  saveResponsesToDatabase,
} from '../surveyResponses';

/**
 * A function that extracts `entityId` and `answers` from a row
 *
 * @callback ResponseExtractor
 * @async
 * @param {string[]} row
 * @returns {{ entityId, answers }}
 */

export class SurveyResponseImporter {
  /**
   * @param {ModelRegistry} models
   * @param {Object<string, ResponseExtractor>} responseExtractors
   */
  constructor(models, responseExtractors) {
    this.models = models;
    this.responseExtractors = responseExtractors;
  }

  /**
   * @public
   * @param {Object<string, Array>} rowsBySurvey
   * @param {string} userId
   * @returns {Promise<Array<{ surveyResponseId, answerIds }>>}
   */
  async import(rowsBySurvey, userId) {
    const results = [];
    await Promise.all(
      Object.entries(rowsBySurvey).map(async ([surveyName, rowsForSurvey]) => {
        const newResults = await this.submitResponsesForSurvey(userId, surveyName, rowsForSurvey);
        results.push(...newResults);
      }),
    );

    return results;
  }

  async submitResponsesForSurvey(userId, surveyName, rows) {
    const survey = await this.models.survey.findOne({ name: surveyName });
    const responses = await this.getResponsesForSurvey(survey, rows);

    return this.models.wrapInTransaction(async transactingModels => {
      // Upsert entities and options that were created in user's local database
      await upsertEntitiesAndOptions(transactingModels, responses);
      // Allow responses to be submitted in bulk
      await validateSurveyResponses(transactingModels, responses);
      return saveResponsesToDatabase(transactingModels, userId, responses);
    });
  }

  getResponsesForSurvey = async (survey, rows) => {
    const responseExtractor = this.responseExtractors[survey.name];

    const mapAnswersToResponses = async row => {
      const { entityId, answers } = await responseExtractor(row);

      return {
        entity_id: entityId,
        survey_id: survey.id,
        timestamp: Date.now(),
        answers,
      };
    };

    return Promise.all(rows.map(mapAnswersToResponses));
  };
}
