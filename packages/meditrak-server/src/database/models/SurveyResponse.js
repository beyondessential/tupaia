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

  async isEventBased() {
    const survey = await this.survey();
    if (survey.can_repeat) {
      return true;
    }

    return this.isForTrackedEntity();
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

  isDeletable = true;

  static onChange = async (change, record, model) => {
    const modelDetails = {
      type: 'SurveyResponse',
      record_id: record.id,
    };

    if (change.type === 'delete') {
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
