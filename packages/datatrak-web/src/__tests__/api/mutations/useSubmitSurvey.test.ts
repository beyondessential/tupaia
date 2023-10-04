/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { act } from 'react-dom/test-utils';
import { generatePath } from 'react-router';
import moment from 'moment';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { QuestionType } from '@tupaia/types';
import { getBrowserTimeZone } from '@tupaia/utils';
import { processSurveyResponse, useSubmitSurvey } from '../../../api/mutations';
import { renderMutation } from '../../helpers/render';
import { successToast } from '../../../utils';
import { Coconut } from '../../../components';
import { ROUTES } from '../../../constants';

// Mock out the useSurveyResponseData hook so that we don't need tp mock out everything that that hook uses
jest.mock('../../../api/mutations', () => {
  const actual = jest.requireActual('../../../api/mutations');
  return {
    ...actual,
    useSurveyResponseData: jest.fn().mockReturnValue({
      surveyStartTime: 'theStartTime',
      surveyId: 'theSurveyId',
      countryId: 'theCountryId',
      questions: [
        {
          questionId: 'question1',
          questionType: QuestionType.FreeText,
          id: '1',
          componentNumber: 1,
          questionText: 'question1',
          screenId: 'screen1',
        },
        {
          questionId: 'question2',
          questionType: QuestionType.Number,
          id: '2',
          questionText: 'question2',
          screenId: 'screen2',
          componentNumber: 2,
        },
      ],
    }),
  };
});

// Mock out the react-router hooks so that we can check the correct path is navigated to
const mockedUseNavigate = jest.fn();
jest.mock('react-router', () => {
  const actual = jest.requireActual('react-router');
  return {
    ...actual,
    generatePath: jest.fn().mockReturnValue('thePath'),
    useNavigate: jest.fn(() => mockedUseNavigate),
    useParams: jest.fn().mockReturnValue({}),
  };
});

// Mock out the successToast function so that we can check that it is called with the correct arguments
jest.mock('../../../utils/toast', () => {
  const actual = jest.requireActual('../../../utils/toast');
  return {
    ...actual,
    successToast: jest.fn(),
  };
});

// Mock out moment so that that toISOString returns a consistent value for our tests
jest.mock('moment', () => {
  const mMoment = {
    toISOString: jest.fn(() => 'theISOString'),
  };
  return jest.fn(() => mMoment);
});

const server = setupServer(
  rest.post('*/v1/submitSurvey', (_, res, ctx) => {
    return res(ctx.status(200));
  }),
);
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('processSurveyResponse', () => {
  const responseData = {
    surveyId: 'theSurveyId',
    countryId: 'theCountryId',
    surveyStartTime: 'theStartTime',
  };

  const processedResponseData = {
    survey_id: 'theSurveyId',
    start_time: 'theStartTime',
    data_time: moment().toISOString(),
    entity_id: 'theCountryId',
    end_time: moment().toISOString(),
    timestamp: moment().toISOString(),
    timezone: getBrowserTimeZone(),
    options_created: [],
    entities_upserted: [],
  };

  it('should process the survey response with standard question types', () => {
    const result = processSurveyResponse({
      ...responseData,
      questions: [
        {
          questionId: 'question1',
          questionType: QuestionType.FreeText,
          id: '1',
          componentNumber: 1,
          questionText: 'question1',
          screenId: 'screen1',
        },
        {
          questionId: 'question2',
          questionType: QuestionType.Number,
          id: '2',
          questionText: 'question2',
          screenId: 'screen2',
          componentNumber: 2,
        },
      ],
      answers: {
        question1: 'answer1',
        question2: 'answer2',
      },
    });

    expect(result).toEqual({
      ...processedResponseData,
      answers: [
        {
          id: '1',
          question_id: 'question1',
          type: QuestionType.FreeText,
          body: 'answer1',
        },
        {
          id: '2',
          question_id: 'question2',
          type: QuestionType.Number,
          body: 'answer2',
        },
      ],
    });
  });

  it('should set the entity_id as the answer when question type is "PrimaryEntity"', () => {
    const result = processSurveyResponse({
      ...responseData,
      questions: [
        {
          questionId: 'question1',
          questionType: QuestionType.PrimaryEntity,
          id: '1',
          componentNumber: 1,
          questionText: 'question1',
          screenId: 'screen1',
        },
      ],
      answers: {
        question1: 'answer1',
      },
    });

    expect(result).toEqual({
      ...processedResponseData,
      entity_id: 'answer1',
      answers: [],
    });
  });

  it('should set the data_time as the answer when question type is "DateOfData"', () => {
    const result = processSurveyResponse({
      ...responseData,
      questions: [
        {
          questionId: 'question1',
          questionType: QuestionType.DateOfData,
          id: '1',
          componentNumber: 1,
          questionText: 'question1',
          screenId: 'screen1',
        },
      ],
      answers: {
        question1: 'answer1',
      },
    });

    expect(result).toEqual({
      ...processedResponseData,
      data_time: moment('answer1').toISOString(),
      answers: [],
    });
  });

  it('should set the data_time as the answer when question type is "SubmissionDate"', () => {
    const result = processSurveyResponse({
      ...responseData,
      questions: [
        {
          questionId: 'question1',
          questionType: QuestionType.SubmissionDate,
          id: '1',
          componentNumber: 1,
          questionText: 'question1',
          screenId: 'screen1',
        },
      ],
      answers: {
        question1: 'answer1',
      },
    });

    expect(result).toEqual({
      ...processedResponseData,
      data_time: moment('answer1').toISOString(),
      answers: [],
    });
  });

  it('should add new options to options_created when type is "Autocomplete" and answer is marked as "isNew"', () => {
    const result = processSurveyResponse({
      ...responseData,
      questions: [
        {
          questionId: 'question1',
          questionType: QuestionType.Autocomplete,
          id: '1',
          componentNumber: 1,
          questionText: 'question1',
          screenId: 'screen1',
        },
      ],
      answers: {
        question1: {
          isNew: true,
          value: 'answer1',
          label: 'answer1',
          optionSetId: 'optionSetId',
        },
      },
    });

    expect(result).toEqual({
      ...processedResponseData,
      options_created: [
        {
          option_set_id: 'optionSetId',
          value: 'answer1',
          label: 'answer1',
        },
      ],
      answers: [
        {
          id: '1',
          question_id: 'question1',
          type: QuestionType.Autocomplete,
          body: 'answer1',
        },
      ],
    });
  });

  it('should not add new options to options_created when type is "Autocomplete" and answer is not marked as "isNew"', () => {
    const result = processSurveyResponse({
      ...responseData,
      questions: [
        {
          questionId: 'question1',
          questionType: QuestionType.Autocomplete,
          id: '1',
          componentNumber: 1,
          questionText: 'question1',
          screenId: 'screen1',
        },
      ],
      answers: {
        question1: {
          value: 'answer1',
          label: 'answer1',
          optionSetId: 'optionSetId',
        },
      },
    });

    expect(result).toEqual({
      ...processedResponseData,
      answers: [
        {
          id: '1',
          question_id: 'question1',
          type: QuestionType.Autocomplete,
          body: 'answer1',
        },
      ],
    });
  });

  it('should add to entities_upserted when type is "Entity" and a create config is set', () => {
    const result = processSurveyResponse({
      ...responseData,
      questions: [
        {
          questionId: 'question1',
          questionType: QuestionType.Entity,
          config: {
            entity: {
              createNew: true,
            },
          },
          id: '1',
          componentNumber: 1,
          questionText: 'question1',
          screenId: 'screen1',
        },
      ],
      answers: {
        question1: 'answer1',
      },
    });

    expect(result).toEqual({
      ...processedResponseData,
      entities_upserted: [
        {
          questionId: 'question1',
          config: {
            entity: {
              createNew: true,
            },
          },
        },
      ],
      answers: [
        {
          id: '1',
          question_id: 'question1',
          type: QuestionType.Entity,
          body: 'answer1',
        },
      ],
    });
  });

  it('should not add to entities_upserted when type is "Entity" and a create config is not set', () => {
    const result = processSurveyResponse({
      ...responseData,
      questions: [
        {
          questionId: 'question1',
          questionType: QuestionType.Entity,
          id: '1',
          componentNumber: 1,
          questionText: 'question1',
          screenId: 'screen1',
        },
      ],
      answers: {
        question1: 'answer1',
      },
    });

    expect(result).toEqual({
      ...processedResponseData,
      answers: [
        {
          id: '1',
          question_id: 'question1',
          type: QuestionType.Entity,
          body: 'answer1',
        },
      ],
    });
  });
});

describe('useSubmitSurvey', () => {
  it('should call successToast and navigate to the success screen on successful submission of survey', async () => {
    const { result, waitFor } = renderMutation(useSubmitSurvey);
    act(() => {
      result.current.mutate({
        question1: 'answer1',
        question2: 'answer2',
      });
    });
    await waitFor(() => {
      return result.current.isSuccess;
    });
    expect(result.current.isSuccess).toBe(true);
    expect(successToast).toHaveBeenCalledWith("Congratulations! You've earned a coconut", Coconut);
    expect(mockedUseNavigate).toHaveBeenCalledWith(generatePath(ROUTES.SURVEY_SUCCESS, {}));
  });
});
