import { SyncDirections } from '@tupaia/constants';
import { DatabaseRecord } from '../../DatabaseRecord';
import { MaterializedViewLogDatabaseModel } from '../../analytics';
import { createSurveyResponsePermissionFilter } from '../../permissions';
import { RECORDS } from '../../records';
import { buildSyncLookupSelect } from '../../sync';
import { getLeaderboardQuery } from './leaderboard';
import { processSurveyResponse } from './processSurveyResponse';
import { saveResponsesToDatabase } from './saveToDatabase';
import { upsertAnswers } from './upsertAnswers';
import { upsertEntitiesAndOptions } from './upsertEntitiesAndOptions';
import { validateSurveyResponse, validateSurveyResponses } from './validation';

export class SurveyResponseRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.SURVEY_RESPONSE;

  async getAnswers(conditions = {}) {
    return await this.otherModels.answer.find({ survey_response_id: this.id, ...conditions });
  }
}

export class SurveyResponseModel extends MaterializedViewLogDatabaseModel {
  static syncDirection = SyncDirections.BIDIRECTIONAL;

  /**
   * @param {import('@tupaia/types').DatatrakWebSubmitSurveyResponseRequest.ReqBody | import('@tupaia/types').DatatrakWebResubmitSurveyResponseRequest.ReqBody} surveyResponseData
   */
  static async processSurveyResponse(models, surveyResponseData) {
    return await processSurveyResponse(models, surveyResponseData);
  }

  /**
   * @param {Record<import('@tupaia/types').QuestionType, AnswerBodyParser> | undefined} [answerBodyParsers]
   */
  static async saveResponsesToDatabase(models, userId, surveyResponses, answerBodyParsers) {
    return await saveResponsesToDatabase(models, userId, surveyResponses, answerBodyParsers);
  }

  /**
   * @param {import('../../ModelRegistry').ModelRegistry} models
   * @param {import('@tupaia/types').Answer[]} answers
   * @param {import('@tupaia/types').SurveyResponse["id"]} surveyResponseId
   * @param {Record<import('@tupaia/types').QuestionType, AnswerBodyParser> | undefined} answerBodyParsers
   * @returns {Promise<import('@tupaia/types').Answer[]>}
   * @privateRemarks Does not support offline photo and file uploads. Use
   * `@tupaia/central-server/dataAccessors/upsertAnswers` instead.
   */
  static async upsertAnswers(models, answers, surveyResponseId, answerBodyParsers) {
    return await upsertAnswers(models, answers, surveyResponseId, answerBodyParsers);
  }

  static async upsertEntitiesAndOptions(models, surveyResponses) {
    return await upsertEntitiesAndOptions(models, surveyResponses);
  }

  static async validateSurveyResponse(models, surveyResponseData) {
    return await validateSurveyResponse(models, surveyResponseData);
  }

  static async validateSurveyResponses(models, surveyResponseData) {
    return await validateSurveyResponses(models, surveyResponseData);
  }

  get DatabaseRecordClass() {
    return SurveyResponseRecord;
  }

  async getLeaderboard(projectId = '', rowCount = 10) {
    const bindings = projectId ? [projectId, rowCount] : [rowCount];
    const query = getLeaderboardQuery(projectId);
    return this.database.executeSql(query, bindings);
  }

  async createRecordsPermissionFilter(accessPolicy, criteria = {}, options = {}) {
    return await createSurveyResponsePermissionFilter(
      accessPolicy,
      this.otherModels,
      criteria,
      options,
    );
  }

  async buildSyncLookupQueryDetails() {
    return {
      select: await buildSyncLookupSelect(this, {
        projectIds: 'array_remove(ARRAY[survey.project_id], NULL)',
      }),
      joins: `
        LEFT JOIN survey
          ON survey.id = survey_response.survey_id
          AND survey_response.outdated IS FALSE -- no outdated survey response
      `,
    };
  }
}
