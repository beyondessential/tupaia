/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { get } from 'lodash';
import { DHIS2_RESOURCE_TYPES } from '@tupaia/dhis-api';

import { enrollTrackedEntityInProgramIfNotEnrolled } from '../../../api';
import { generateDataValue } from '../generateDataValue';

const { ORGANISATION_UNIT, PROGRAM } = DHIS2_RESOURCE_TYPES;

const DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

export class EventBuilder {
  constructor(dhisApi, models, surveyResponse) {
    this.api = dhisApi;
    this.models = models;
    this.surveyResponse = surveyResponse;
  }

  async build() {
    const orgUnitCode = await this.fetchOrganisationUnitCode();
    const programCode = await this.fetchProgramCode();
    const event = await this.buildBaseEvent(programCode, orgUnitCode);

    const entity = await this.surveyResponse.entity();
    if (entity.isTrackedEntity()) {
      const trackerEventFields = await this.enrollTrackedEntityAndGetTrackerEventFields(
        entity,
        programCode,
      );
      Object.assign(event, trackerEventFields);
    }

    return event;
  }

  async buildBaseEvent(programCode, orgUnitCode) {
    return {
      program: programCode,
      orgUnit: orgUnitCode,
      eventDate: this.surveyResponse.timezoneAwareSubmissionTime().format(DATE_FORMAT),
      dataValues: await this.buildDataValues(),
    };
  }

  async buildDataValues() {
    const answers = await this.surveyResponse.getAnswers();
    if (!answers || answers.length === 0) {
      throw new Error(`No answers in survey ${this.surveyResponse.id}`);
    }

    const dataValues = [];
    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];
      const dataValue = await generateDataValue(this.models, answer);
      dataValues.push(dataValue);
    }

    return dataValues;
  }

  async enrollTrackedEntityAndGetTrackerEventFields(entity, programCode) {
    const trackedEntityId = entity.getDhisId();
    const program = await this.fetchProgram(programCode);
    if (!program) {
      throw new Error(`Program ${programCode} was not found on DHIS2`);
    }
    const { id: programId, programStages } = program;
    const { code: orgUnitCode } = await entity.fetchNearestOrgUnitAncestor();
    const { id: orgUnitDhisId } = await this.fetchOrganisationUnit(orgUnitCode);
    await enrollTrackedEntityInProgramIfNotEnrolled(this.api, {
      trackedEntityId,
      programId,
      orgUnitId: orgUnitDhisId,
    });

    return {
      trackedEntityInstance: trackedEntityId,
      programStage: programStages[0].id,
    };
  }

  async fetchOrganisationUnitCode() {
    const survey = await this.surveyResponse.survey();
    const eventOrgUnitQuestionId = get(survey, 'integration_metadata.eventOrgUnit.questionId');
    const { code: orgUnitCode } = eventOrgUnitQuestionId
      ? await this.fetchCustomEventOrgUnit(eventOrgUnitQuestionId)
      : await this.fetchDefaultEventOrgUnit();

    return orgUnitCode;
  }

  async fetchCustomEventOrgUnit(eventOrgUnitQuestionId) {
    const { text: orgUnitId } = await this.models.answer.findOne({
      question_id: eventOrgUnitQuestionId,
      survey_response_id: this.surveyResponse.id,
    });

    return this.models.entity.findById(orgUnitId);
  }

  async fetchDefaultEventOrgUnit() {
    const entity = await this.surveyResponse.entity();
    return entity.fetchNearestOrgUnitAncestor();
  }

  async fetchOrganisationUnit(code) {
    return this.api.getRecord({ type: ORGANISATION_UNIT, code });
  }

  async fetchProgramCode() {
    const { code } = await this.surveyResponse.survey();
    return code;
  }

  /**
   * @param {string} code
   * @returns {Promise<{ id, programStages: Array<{ id }> }>}
   */
  async fetchProgram(code) {
    return this.api.getRecord({ type: PROGRAM, code, fields: 'id,programStages' });
  }
}
