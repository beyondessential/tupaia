import { SyncDirections } from '@tupaia/constants';
import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';
import { buildSyncLookupSelect } from '../sync';

export class SurveyResponseDraftRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.SURVEY_RESPONSE_DRAFT;
}

export class SurveyResponseDraftModel extends DatabaseModel {
  static syncDirection = SyncDirections.BIDIRECTIONAL;

  async buildSyncLookupQueryDetails() {
    return {
      select: await buildSyncLookupSelect(this, {
        projectIds: 'array_remove(ARRAY[survey.project_id], NULL)',
      }),
      joins: 'LEFT JOIN survey ON survey.id = survey_response_draft.survey_id',
    };
  }

  get DatabaseRecordClass() {
    return SurveyResponseDraftRecord;
  }
}
