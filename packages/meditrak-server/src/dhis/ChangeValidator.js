/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */
import { ENTITY_TYPES } from '../database/models/Entity';

export class ChangeValidator {
  constructor(models) {
    this.models = models;
  }

  validate = async change => {
    // Deal with the edge case of deletes first, as we don't have the usual information in the db
    if (change.type === 'delete') {
      const { record_id: recordId } = change;
      const existingSyncLogRecord = await this.models.dhisSyncLog.findOne({ record_id: recordId });
      const existingSyncQueueRecord = await this.models.dhisSyncQueue.findOne({
        record_id: recordId,
      });
      // If there is a sync log or queue record with this record_id, the delete record must be
      // valid for the dhis sync queue
      return !!existingSyncLogRecord || !!existingSyncQueueRecord;
    }

    // Creates and updates
    const { record_type: recordType } = change;
    if (recordType === this.models.entity.databaseType) {
      return true;
    }
    let surveyResponse = null;
    if (recordType === this.models.answer.databaseType) {
      const answer = await this.models.answer.findOne({ id: change.record_id });
      if (!answer) {
        throw new Error(
          `No answer found matching change record with record id ${change.record_id}, it has probably been updated then deleted in quick succession`,
        );
      }
      surveyResponse = await this.models.surveyResponse.findOne({ id: answer.survey_response_id });
      const isEventBased = await surveyResponse.isEventBased();
      if (isEventBased) return false; // event based answer changes are synced via the survey response
    } else if (recordType === this.models.surveyResponse.databaseType) {
      surveyResponse = await this.models.surveyResponse.findOne({ id: change.record_id });
    }
    const survey = await this.models.survey.findById(surveyResponse.survey_id);
    const { integration_metadata: integrationMetadata } = survey;
    if (!integrationMetadata.dhis2) return false;

    const country = await surveyResponse.country();
    if (!country) return true; // e.g. world, or a region containing a group of countries
    const { id: countryId } = country;

    const demoLand = await this.models.country.findOne({ name: 'Demo Land' });
    const publicPermissionGroup = await this.models.permissionGroup.findOne({ name: 'Public' });
    const userCountryPermission = await this.models.userCountryPermission.findOne({
      user_id: surveyResponse.user_id,
      country_id: countryId,
      permission_group_id: publicPermissionGroup.id,
    });
    // ignore public demoland responses
    if (countryId === demoLand.id && userCountryPermission) return false;

    return true;
  };
}
