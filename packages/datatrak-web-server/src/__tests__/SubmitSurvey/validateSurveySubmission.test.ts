/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { validateSurveySubmission } from '../../routes/SubmitSurvey/validateSurveySubmission';

const validSurveySubmission = {
  userId: '5f8d29a761f76a2c0a0412d2',
  surveyId: '5f8d29a761f76a2c0a0412d3',
  countryId: '5f8d29a761f76a2c0a0412d4',
  questions: [],
  answers: {},
  startTime: '2023-01-25 18:21:35.684+13',
};
describe('validateSurveyResponse', () => {
  test.each([
    {
      title: 'missing fields',
      data: {
        answers: [],
      },
      expected: "Validation Error: must have required property 'countryId'",
    },
    {
      title: 'questions structure',
      data: { ...validSurveySubmission, questions: '' },
      expected: 'Validation Error:/questions: type must be array',
    },
    {
      title: 'answers structure',
      data: { ...validSurveySubmission, answers: '' },
      expected: 'Validation Error:/answers: type must be object',
    },
    {
      title: 'correct data',
      data: validSurveySubmission,
      expected: null,
    },
  ])('Validates $title', ({ data, expected }) => {
    let errorMessage = null;

    try {
      // @ts-ignore
      validateSurveySubmission(data);
    } catch (error) {
      // @ts-ignore
      errorMessage = error.message;
    }

    expect(errorMessage).toEqual(expected);
  });
});
