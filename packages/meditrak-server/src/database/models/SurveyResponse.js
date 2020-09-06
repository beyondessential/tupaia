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
    const countryEntity = await entity.country();
    return this.otherModels.country.findOne({ code: countryEntity.code });
  }

  async fetchOrganisationUnit() {
    const entity = await this.entity();
    return entity.fetchNearestOrgUnitAncestor();
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

  updateById(id, fieldsToUpdate) {
    // If the entity or date has changed, mark all answers as changed so they resync to DHIS2 with
    // the new entity/date (no need to async/await, just set it going)
    if (fieldsToUpdate.entity_id || fieldsToUpdate.submission_time) {
      this.otherModels.answer.markAsChanged({
        survey_response_id: id,
      });
    }
    return super.updateById(id, fieldsToUpdate);
  }

  getOrgUnitEntityTypes = () => {
    const orgUnitEntityTypes = Object.values(this.otherModels.entity.orgUnitEntityTypes);
    return `(${orgUnitEntityTypes.map(t => `'${t}'`).join(',')})`;
  };

  /**
   * Returns the SQL to inclue only event based survey responses from a statement that has
   * already JOINed both survey and entity
   */
  getOnlyEventsQueryClause = () => `
    (survey.can_repeat = 'TRUE' OR entity.type NOT IN ${this.getOrgUnitEntityTypes()})
  `;

  /**
   * Returns the SQL to exclude event based survey responses from a statement that has
   * already JOINed both survey and entity
   */
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
    if (result.length === 0) return false;
    return result[0].count === '1';
  }

  static onChange = async ({ type: changeType, record }, model) => {
    const modelDetails = {
      type: 'SurveyResponse',
      record_id: record.id,
    };

    if (changeType === 'delete') {
      model.otherModels.userReward.delete(modelDetails);
    } else {
      model.otherModels.userReward.updateOrCreate(modelDetails, {
        ...modelDetails,
        coconuts: 1,
        user_id: record.user_id,
        creation_date: record.end_time,
      });
    }
  };
}
