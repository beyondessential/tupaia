import { SyncDirections } from '@tupaia/constants';
import { DatabaseRecord } from '../../DatabaseRecord';
import { MaterializedViewLogDatabaseModel } from '../../analytics';
import { createSurveyResponsePermissionFilter } from '../../permissions';
import { RECORDS } from '../../records';
import { buildSyncLookupSelect } from '../../sync';
import { getLeaderboardQuery } from './leaderboard';
import { processSurveyResponse } from './processSurveyResponse';
import { upsertEntitiesAndOptions } from './upsertEntitiesAndOptions';

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

  static async upsertEntitiesAndOptions(models, surveyResponses) {
    return await upsertEntitiesAndOptions(models, surveyResponses);
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
