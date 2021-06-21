/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import momentTimezone from 'moment-timezone';
import moment from 'moment';

import { MaterializedViewLogDatabaseModel, DatabaseType, TYPES } from '@tupaia/database';

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
    return this.otherModels.country.findOne({ code: entity.country_code });
  }

  async fetchOrganisationUnit() {
    const entity = await this.entity();
    return entity.fetchNearestOrgUnitAncestor();
  }

  async isForTrackedEntity() {
    const entity = await this.entity();
    return entity.isTrackedEntity();
  }

  dataTime() {
    return moment(this.data_time);
  }

  timezoneAwareEndTime() {
    return momentTimezone(this.end_time).tz(this.timezone);
  }
}

export class SurveyResponseModel extends MaterializedViewLogDatabaseModel {
  get DatabaseTypeClass() {
    return SurveyResponseType;
  }

  isDeletableViaApi = true;

  updateById(id, fieldsToUpdate) {
    // If the entity or date has changed, mark all answers as changed so they resync to DHIS2 with
    // the new entity/date (no need to async/await, just set it going)
    if (fieldsToUpdate.entity_id || fieldsToUpdate.data_time) {
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
}
