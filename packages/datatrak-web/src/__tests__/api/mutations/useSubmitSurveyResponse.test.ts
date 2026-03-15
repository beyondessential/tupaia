import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { act } from 'react-dom/test-utils';
import { generatePath } from 'react-router';

import { QuestionType } from '@tupaia/types';

import { useSubmitSurveyResponse } from '../../../api/mutations';
import { Coconut } from '../../../components';
import { ROUTES } from '../../../constants';
import { successToast } from '../../../utils';
import { renderMutation } from '../../helpers/render';

jest.mock('../../../api/queries', () => {
  return {
    useUser: jest.fn().mockReturnValue({}),
    useSurvey: jest.fn().mockReturnValue({}),
    useEntityByCode: jest.fn().mockReturnValue({}),
  };
});

jest.mock('../../../features/Survey/SurveyContext/SurveyContext.tsx', () => ({
  useSurveyForm: () => ({
    resetForm: () => 'doReset',
  }),
}));

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
          type: QuestionType.FreeText,
          id: '1',
          componentId: '1',
          componentNumber: 1,
          text: 'question1',
        },
        {
          questionId: 'question2',
          type: QuestionType.Number,
          id: '2',
          componentId: '2',
          text: 'question2',
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

const server = setupServer(
  rest.post('*/v1/submitSurveyResponse', (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        createdEntities: [],
      }),
    );
  }),
);
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useSubmitSurvey', () => {
  it('should call successToast and navigate to the success screen on successful submission of survey', async () => {
    const { result, waitFor } = await renderMutation(useSubmitSurveyResponse);
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
    expect(successToast).toHaveBeenCalledWith('Congratulations! You’ve earned a coconut', Coconut);
    expect(mockedUseNavigate).toHaveBeenCalledWith(generatePath(ROUTES.SURVEY_SUCCESS, {}), {
      state: {
        surveyResponse: JSON.stringify({
          createdEntities: [],
        }),
      },
    });
  });
});
