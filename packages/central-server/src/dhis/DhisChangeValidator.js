import { SqlQuery } from '@tupaia/database';
import { getUniqueEntries } from '@tupaia/utils';
import { ChangeValidator } from '../externalApiSync';

export class DhisChangeValidator extends ChangeValidator {
  queryValidSurveyResponseIds = async (surveyResponseIds, settings = {}) => {
    const { excludeEventBased = false, outdated = false } = settings;
    const nonPublicDemoLandUsers = (
      await this.models.database.executeSql(
        `
          SELECT DISTINCT user_id
          FROM user_entity_permission
          JOIN entity ON entity.id = user_entity_permission.entity_id
          JOIN permission_group ON permission_group.id = user_entity_permission.permission_group_id
          WHERE entity.code = 'DL'
          AND permission_group.name <> 'Public';
        `,
      )
    ).map(r => r.user_id);

    const validSurveyResponseIds = [];
    const batchSize = this.models.database.maxBindingsPerQuery - nonPublicDemoLandUsers.length;
    for (let i = 0; i < surveyResponseIds.length; i += batchSize) {
      const batchOfSurveyResponseIds = surveyResponseIds.slice(i, i + batchSize);

      const batchOfSurveyResponses = await this.models.database.executeSql(
        `
          SELECT DISTINCT survey_response.id as id
          FROM survey_response
          JOIN survey ON survey_response.survey_id = survey.id
          JOIN data_group ON data_group.id = survey.data_group_id
          JOIN entity ON survey_response.entity_id = entity.id
          AND data_group.service_type = 'dhis'
          AND (
            entity.country_code <> 'DL'
            OR survey_response.user_id IN ${SqlQuery.record(nonPublicDemoLandUsers)}
          )
          ${
            excludeEventBased
              ? `AND ${this.models.surveyResponse.getExcludeEventsQueryClause()}`
              : ''
          }
          AND survey_response.outdated = ?
          AND survey_response.id IN ${SqlQuery.record(batchOfSurveyResponseIds)};
        `,
        [...nonPublicDemoLandUsers, outdated, ...batchOfSurveyResponseIds],
      );

      validSurveyResponseIds.push(...batchOfSurveyResponses.map(r => r.id));
    }
    return validSurveyResponseIds;
  };

  getAssociatedAnswers = async (surveyResponseIds, allChanges) => {
    const answerChanges = allChanges.filter(c => c.record_type === 'answer');
    // get the answers associated with the survey responses
    const associatedAnswers = await this.models.answer.find({
      survey_response_id: surveyResponseIds,
    });

    const filteredAnswers = associatedAnswers.filter(a => {
      const change = answerChanges.find(c => c.record_id === a.id);
      if (change) {
        return false;
      }
      return true;
    });

    if (filteredAnswers.length === 0) return [];

    // filter out answers for questions that do not sync to dhis
    const dhisLinkedAnswers = await this.filterDhisLinkedAnswers(filteredAnswers);

    return dhisLinkedAnswers;
  };

  getDeletesForAssociatedAnswers = async (surveyResponseIds, allChanges) => {
    const answersToChange = await this.getAssociatedAnswers(surveyResponseIds, allChanges);

    // create delete changes for the answers
    const outdatedAnswerDeletes = await Promise.all(
      answersToChange.map(async a => ({
        record_type: 'answer',
        record_id: a.id,
        type: 'delete',
        new_record: null,
        old_record: await a.getData(),
      })),
    );

    return outdatedAnswerDeletes;
  };

  getOutdatedAnswersAndSurveyResponses = async changes => {
    // get the survey response changes that are already outdated
    const surveyResponseChangesThatAreAlreadyOutdated = changes
      .filter(
        c =>
          c.record_type === 'survey_response' &&
          c.new_record &&
          c.new_record.outdated === true &&
          c.old_record &&
          c.old_record.outdated === true,
      )
      .map(c => c.record_id);
    // get the survey response ids that are being updated to 'outdated'
    const surveyResponseUpdateIds = await this.getValidSurveyResponseUpdates(changes, {
      excludeEventBased: false,
      outdated: true,
    });

    // ignore survey response changes that are already outdated
    const validSurveyResponseIds = surveyResponseUpdateIds.filter(
      id => !surveyResponseChangesThatAreAlreadyOutdated.includes(id),
    );

    if (validSurveyResponseIds.length === 0) return [];

    // get the survey response changes that are being updated to 'outdated'
    const surveyResponseChanges = this.filterChangesWithMatchingIds(
      changes,
      validSurveyResponseIds,
    );

    if (surveyResponseChanges.length === 0) return [];

    const outdatedSurveyResponseDeletes = surveyResponseChanges.map(s => ({
      ...s,
      type: 'delete',
      new_record: null,
    }));

    // get the answers that are associated with the survey responses that are being updated to 'outdated'
    const deleteAnswers = await this.getDeletesForAssociatedAnswers(
      surveyResponseUpdateIds,
      changes,
    );

    return [...outdatedSurveyResponseDeletes, ...deleteAnswers];
  };

  getValidDeletes = async changes => {
    const outdatedSurveyResponseDeletes = await this.getOutdatedAnswersAndSurveyResponses(changes);

    const previouslySyncedDeletes = await this.getPreviouslySyncedDeletes(
      changes,
      this.models.dhisSyncQueue,
      this.models.dhisSyncLog,
    );

    return [...outdatedSurveyResponseDeletes, ...previouslySyncedDeletes];
  };

  getValidAnswerUpdates = async updateChanges => {
    const answers = this.getRecordsFromChangesForModel(updateChanges, this.models.answer);

    if (answers.length === 0) return [];
    const surveyResponseIds = getUniqueEntries(answers.map(a => a.survey_response_id));

    // check which survey responses are valid
    const validSurveyResponseIds = new Set(
      await this.queryValidSurveyResponseIds(surveyResponseIds, {
        excludeEventBased: true,
        outdated: false,
      }),
    );

    // filter out answers for questions that do not sync to dhis
    const dhisLinkedAnswers = await this.filterDhisLinkedAnswers(answers);

    // return the answers that are part of a valid survey response
    return dhisLinkedAnswers
      .filter(a => validSurveyResponseIds.has(a.survey_response_id))
      .map(a => a.id);
  };

  /**
   * Returns the set of answers that are linked via a data element to the dhis service type
   * @param answers Answer[]
   * @returns {Promise<Answer[]>}
   * @private
   */
  filterDhisLinkedAnswers = async answers => {
    const filteredAnswers = [];

    for (const answer of answers) {
      const question = await this.models.question.findById(answer.question_id);
      const dataElement = await question.dataElement();
      if (!dataElement) {
        throw new Error(`Could not find a data element for question ${question.code}`);
      }

      if (dataElement.service_type === 'dhis') {
        filteredAnswers.push(answer);
      }
    }

    return filteredAnswers;
  };

  getValidSurveyResponseUpdates = async (updateChanges, settings = {}) => {
    const surveyResponseIds = this.getIdsFromChangesForModel(
      updateChanges,
      this.models.surveyResponse,
    );

    if (surveyResponseIds.length === 0) return [];
    return this.queryValidSurveyResponseIds(surveyResponseIds, settings);
  };

  getValidEntityUpdates = async updateChanges => {
    const entityIds = this.getIdsFromChangesForModel(updateChanges, this.models.entity);
    if (entityIds.length === 0) return [];

    const entities = await this.models.entity.findManyById(entityIds);
    return entities.filter(e => e.allowsPushingToDhis()).map(e => e.id);
  };

  // get associated answers for the survey responses that are being reinstated or updated
  getAnswersToUpdate = async allChanges => {
    const surveyResponseChanges = await allChanges.filter(
      c => c.record_type === 'survey_response' && c.new_record && c.new_record.outdated === false,
    );

    const surveyResponseIdsToUpdate = surveyResponseChanges.map(c => c.record_id);

    const answerChanges = await this.getAssociatedAnswers(surveyResponseIdsToUpdate, allChanges);
    return Promise.all(
      answerChanges.map(async a => {
        const data = await a.getData();
        return {
          record_type: 'answer',
          record_id: a.id,
          type: 'update',
          new_record: data,
          old_record: data,
        };
      }),
    );
  };

  getValidUpdates = async changes => {
    const updateChanges = this.getUpdateChanges(changes);
    const validEntityIds = await this.getValidEntityUpdates(updateChanges);
    const validAnswerIds = await this.getValidAnswerUpdates(updateChanges);
    const validSurveyResponseIds = await this.getValidSurveyResponseUpdates(updateChanges, {
      outdated: false,
    });
    const answersToUpdate = await this.getAnswersToUpdate(changes);

    const changesToBeMade = [
      ...this.filterChangesWithMatchingIds(changes, [
        ...validEntityIds,
        ...validAnswerIds,
        ...validSurveyResponseIds,
        ...answersToUpdate,
      ]),
      ...answersToUpdate,
    ];
    return changesToBeMade;
  };
}
