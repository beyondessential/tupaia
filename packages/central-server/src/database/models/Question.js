import { MaterializedViewLogDatabaseModel, DatabaseRecord, RECORDS } from '@tupaia/database';
import { reduceToDictionary } from '@tupaia/utils';

class QuestionRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.QUESTION;

  dataElement = async () => this.otherModels.dataElement.findById(this.data_element_id);

  async getSurveyIds() {
    const surveyScreens = await this.database.executeSql(
      `
      SELECT survey_screen.survey_id
      FROM survey_screen
      INNER JOIN survey_screen_component
        ON survey_screen_component.screen_id = survey_screen.id
      WHERE survey_screen_component.question_id = ?
    `,
      this.id,
    );
    return surveyScreens.map(s => s.survey_id);
  }
}

const HOOKS_BY_ID_CACHE_KEY = 'hooksByQuestionId';

export class QuestionModel extends MaterializedViewLogDatabaseModel {
  notifiers = [onChangeUpdateDataElement];

  get DatabaseRecordClass() {
    return QuestionRecord;
  }

  get cacheEnabled() {
    return true;
  }

  meditrakConfig = {
    minAppVersion: '0.0.1',
  };

  async getHooksByQuestionId() {
    return this.runCachedFunction(HOOKS_BY_ID_CACHE_KEY, async () => {
      const questionsWithHooks = await this.database.executeSql(`
        SELECT id, hook
        FROM question
        WHERE hook IS NOT NULL;
      `);
      return reduceToDictionary(questionsWithHooks, 'id', 'hook');
    });
  }
}

const onChangeUpdateDataElement = async (
  { type: changeType, old_record: oldRecord, new_record: newRecord },
  models,
) => {
  switch (changeType) {
    case 'update': {
      const { code, data_element_id: dataElementId } = newRecord;
      return models.dataElement.updateById(dataElementId, { code });
    }
    case 'delete': {
      const { data_element_id: dataElementId } = oldRecord;
      return models.dataElement.deleteById(dataElementId);
    }
    default:
      throw new Error(`Non supported change type: ${changeType}`);
  }
};
