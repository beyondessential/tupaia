/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import groupBy from 'lodash.groupby';
import keyBy from 'lodash.keyby';

import { reduceToDictionary } from '@tupaia/utils';
import { buildEventFromSurveyResponse } from './buildEventFromSurveyResponse';

export class TupaiaDataApi {
  constructor(models) {
    this.models = models;
  }

  async getEvents(options) {
    const {
      programCode,
      organisationUnitCode,
      startDate,
      endDate,
      eventId,
      dataElementCodes = [],
    } = options;

    const surveyResponses = await this.findSurveyResponsesForEvents({
      programCode,
      organisationUnitCode,
      startDate,
      endDate,
      eventId,
    });
    return this.buildEvents(surveyResponses, { dataElementCodes });
  }

  async findSurveyResponsesForEvents({
    programCode,
    organisationUnitCode,
    startDate,
    endDate,
    eventId,
    // TODO: Add support for `trackedEntityInstance`
  }) {
    const { id: surveyId } = await this.models.survey.findOne({ code: programCode });
    const { id: entityId } = await this.models.entity.findOne({ code: organisationUnitCode });

    const findConditions = {
      survey_id: surveyId,
      entity_id: entityId,
    };
    if (eventId) {
      findConditions.id = eventId;
    }
    // TODO handle startDate, endDate conditions

    return this.models.surveyResponse.find(findConditions);
  }

  async buildEvents(surveyResponses, { dataElementCodes }) {
    const questions = await this.models.question.find({ code: dataElementCodes });
    const questionIdToCode = reduceToDictionary(questions, 'id', 'code');

    const answers = await this.models.answers.find({
      survey_response_id: surveyResponses.map(({ id }) => id),
      question_id: questions.map(({ id }) => id),
    });
    const answersBySurveyResponseId = groupBy(answers, 'survey_response_id');

    const entities = await this.models.entity.find({
      code: surveyResponses.map(({ entity_id: entityId }) => entityId),
    });
    const entityById = keyBy(entities, 'id');

    return surveyResponses.map(surveyResponse =>
      buildEventFromSurveyResponse(surveyResponse, {
        questionIdToCode,
        entity: entityById[surveyResponse.entity_id],
        answers: answersBySurveyResponseId[surveyResponse.id],
      }),
    );
  }

  async getAnalytics(options) {
    // TODO implement
  }

  async fetchDataElements(dataElementCodes) {
    // TODO implement
  }
}
