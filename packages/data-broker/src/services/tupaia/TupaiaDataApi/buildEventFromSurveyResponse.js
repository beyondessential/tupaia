/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export const buildEventFromSurveyResponse = (
  surveyResponse,
  { questionIdToCode, entity, answers },
) => {
  const { survey_response_id: event, submission_time: eventDate } = surveyResponse;

  const dataValues = answers.reduce((values, { question_id: questionId, text }) => {
    const questionCode = questionIdToCode[questionId];
    return { ...values, [questionCode]: text };
  }, {});

  return {
    event,
    orgUnit: entity.code, // TODO not correct for Strive `cases`
    orgUnitName: entity.name,
    eventDate, // TODO Must convert to the expected format
    dataValues,
  };
};
