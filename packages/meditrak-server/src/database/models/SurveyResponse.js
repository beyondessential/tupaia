/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import momentTimezone from 'moment-timezone';

import { DatabaseModel, DatabaseType, TYPES } from '@tupaia/database';
class SurveyResponseType extends DatabaseType {
  static databaseType = TYPES.SURVEY_RESPONSE;

  async getAnswers(conditions = {}) {
    return this.otherModels.answer.find({ survey_response_id: this.id, ...conditions });
  }

  async user() {
    return this.otherModels.user.findById(this.user_id);
  }

  async survey() {
    return this.otherModels.survey.findById(this.survey_id);
  }

  async entity() {
    return this.otherModels.entity.findById(this.entity_id);
  }

  async country() {
    const entity = await this.entity();
    return entity.country();
  }

  async fetchOrganisationUnit() {
    const entity = await this.entity();
    return entity.fetchClosestOrganisationUnit();
  }

  async isForTrackedEntity() {
    const entity = await this.entity();
    return entity.isTrackedEntity();
  }

  timezoneAwareSubmissionTime() {
    return momentTimezone(this.submission_time).tz(this.timezone);
  }

  timezoneAwareEndTime() {
    return momentTimezone(this.end_time).tz(this.timezone);
  }
}

export class SurveyResponseModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return SurveyResponseType;
  }

  isDeletableViaApi = true;

  /**
   * Returns the SQL to inclue/exclude event based survey responses from a statement that has
   * already JOINed both survey and entity
   * @param {boolean} excludeEvents        Whether to query for non-event or event responses
   * @param {boolean} [isFirstClause=true] If true the clause will start with WHERE, otherwise AND
   */
  getEventBasedQueryClause = (includeEvents, isFirstClause = false) => {
    const orgUnitEntityTypes = Object.values(this.otherModels.entity.orgUnitEntityTypes);
    if (includeEvents)
      return `
      ${isFirstClause ? 'WHERE' : 'AND'}
        survey.can_repeat = ${includeEvents ? 'TRUE' : 'FALSE'}
      AND
        entity.type ${includeEvents ? 'NOT IN' : 'IN'} (${orgUnitEntityTypes
        .map(t => `'${t}'`)
        .join(',')})
    `;
  };

  getOrgUnitEntityTypes = () => {
    const orgUnitEntityTypes = Object.values(this.otherModels.entity.orgUnitEntityTypes);
    return `(${orgUnitEntityTypes.map(t => `'${t}'`).join(',')})`;
  };

  getOnlyEventsQueryClause = () => `
    (survey.can_repeat = 'TRUE' OR entity.type NOT IN ${this.getOrgUnitEntityTypes()})
  `;

  getExcludeEventsQueryClause = () => `
    (survey.can_repeat = 'FALSE' AND entity.type IN ${this.getOrgUnitEntityTypes()})
  `;

  async checkIsEventBased(surveyResponseId) {
    const result = await this.database.executeSql(
      `
      SELECT count(*)
      FROM survey_response
      JOIN survey ON survey.id = survey_response.survey_id
      JOIN entity ON entity.id = survey_response.entity_id
      WHERE survey_response.id = ?
      AND ${this.getOnlyEventsQueryClause()}
    `,
      [surveyResponseId],
    );
    return result[0].count === 1;
  }

  static onChange = async (change, model) => {
    const modelDetails = {
      type: 'SurveyResponse',
      record_id: change.record_id,
    };

    if (change.type === 'delete') {
      model.otherModels.userReward.delete(modelDetails);
    } else {
      const surveyResponse = await model.findById(change.record_id);
      model.otherModels.userReward.updateOrCreate(modelDetails, {
        ...modelDetails,
        coconuts: 1,
        user_id: surveyResponse.user_id,
        creation_date: surveyResponse.end_time,
      });
    }
  };
}
