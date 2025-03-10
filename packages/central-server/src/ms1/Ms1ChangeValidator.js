import { ChangeValidator } from '../externalApiSync';

export class Ms1ChangeValidator extends ChangeValidator {
  getValidDeletes = async changes => {
    return this.getPreviouslySyncedDeletes(changes, this.models.ms1SyncQueue);
  };

  fetchDemoLandEntityIds = async () => {
    if (!this.demolandEntityIds) {
      const demolandEntities = await this.models.entity.find({ country_code: 'DL' });
      this.demolandEntityIds = demolandEntities.map(({ id }) => id);
    }
    return this.demolandEntityIds;
  };

  fetchMs1SurveyIds = async () => {
    if (!this.ms1SurveyIds) {
      const ms1Surveys = await this.models.database.executeSql(`
        SELECT id
        FROM survey
        WHERE integration_metadata->'ms1' \\? 'endpoint';
      `);
      this.ms1SurveyIds = ms1Surveys.map(({ id }) => id);
    }
    return this.ms1SurveyIds;
  };

  getValidUpdates = async changes => {
    const demolandEntityIds = await this.fetchDemoLandEntityIds();
    const ms1SurveyIds = await this.fetchMs1SurveyIds();
    const surveyResponses = this.getRecords(changes);
    const validationById = {};
    surveyResponses.forEach(surveyResponse => {
      // ditch if demoland
      if (demolandEntityIds.includes(surveyResponse.entity_id)) {
        validationById[surveyResponse.id] = false;
        return;
      }

      // valid if it was for an ms1 survey
      validationById[surveyResponse.id] = ms1SurveyIds.includes(surveyResponse.survey_id);
    });
    return changes.filter(c => validationById[c.record_id]);
  };
}
