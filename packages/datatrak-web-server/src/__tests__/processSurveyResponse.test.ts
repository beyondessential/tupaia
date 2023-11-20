/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { QuestionType } from '@tupaia/types';
import { getBrowserTimeZone, getUniqueSurveyQuestionFileName } from '@tupaia/utils';
import { generateId } from '@tupaia/database';
import { processSurveyResponse } from '../routes/SubmitSurvey/processSurveyResponse';

// Mock out moment so that that toISOString returns a consistent value for our tests
jest.mock('moment', () => {
  const mMoment = {
    toISOString: jest.fn(() => 'theISOString'),
  };
  return jest.fn(() => mMoment);
});

const mockFindEntityById = async (id: string) => ({
  id: 'theEntityId',
  code: 'theEntityCode',
  name: 'The Entity Name',
});

jest.mock('@tupaia/database', () => ({
  generateId: jest.fn(() => 'theEntityId'),
}));

jest.mock('@tupaia/utils', () => ({
  ...jest.requireActual('@tupaia/utils'),
  getUniqueSurveyQuestionFileName: jest.fn(() => 'theUniqueId'),
}));

describe('processSurveyResponse', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date(2020, 3, 1));
  });

  afterAll(() => {
    jest.useRealTimers();
  });
  const date = new Date(2020, 3, 1);
  const timestamp = date.toISOString();
  const responseData = {
    userId: 'theUserId',
    surveyId: 'theSurveyId',
    countryId: 'theCountryId',
    startTime: 'theStartTime',
  };

  const processedResponseData = {
    survey_id: 'theSurveyId',
    user_id: 'theUserId',
    start_time: 'theStartTime',
    data_time: timestamp,
    entity_id: 'theCountryId',
    end_time: timestamp,
    timestamp: timestamp,
    timezone: getBrowserTimeZone(),
    options_created: [],
    entities_upserted: [],
    qr_codes_to_create: [],
  };

  it('should process the survey response with standard question types', async () => {
    const result = await processSurveyResponse(
      {
        ...responseData,
        questions: [
          {
            questionId: 'question1',
            type: QuestionType.FreeText,
            componentNumber: 1,
            text: 'question1',
            screenId: 'screen1',
          },
          {
            questionId: 'question2',
            type: QuestionType.Number,
            text: 'question2',
            screenId: 'screen2',
            componentNumber: 2,
          },
        ],
        answers: {
          question1: 'answer1',
          question2: 'answer2',
        },
      },
      mockFindEntityById,
    );

    expect(result).toEqual({
      ...processedResponseData,
      answers: [
        {
          question_id: 'question1',
          type: QuestionType.FreeText,
          body: 'answer1',
        },
        {
          question_id: 'question2',
          type: QuestionType.Number,
          body: 'answer2',
        },
      ],
    });
  });

  it('should set the entity_id as the answer when question type is "PrimaryEntity"', async () => {
    const result = await processSurveyResponse(
      {
        ...responseData,
        questions: [
          {
            questionId: 'question1',
            type: QuestionType.PrimaryEntity,
            componentNumber: 1,
            text: 'question1',
            screenId: 'screen1',
          },
        ],
        answers: {
          question1: 'answer1',
        },
      },
      mockFindEntityById,
    );

    expect(result).toEqual({
      ...processedResponseData,
      entity_id: 'answer1',
      answers: [],
    });
  });

  it('should set the data_time as the answer when question type is "DateOfData"', async () => {
    const result = await processSurveyResponse(
      {
        ...responseData,
        questions: [
          {
            questionId: 'question1',
            type: QuestionType.DateOfData,
            componentNumber: 1,
            text: 'question1',
            screenId: 'screen1',
          },
        ],
        answers: {
          question1: '2022-01-01',
        },
      },
      mockFindEntityById,
    );

    expect(result).toEqual({
      ...processedResponseData,
      data_time: new Date('2022-01-01').toISOString(),
      answers: [],
    });
  });

  it('should set the data_time as the answer when question type is "SubmissionDate"', async () => {
    const result = await processSurveyResponse(
      {
        ...responseData,
        questions: [
          {
            questionId: 'question1',
            type: QuestionType.SubmissionDate,
            componentNumber: 1,
            text: 'question1',
            screenId: 'screen1',
          },
        ],
        answers: {
          question1: '2022-01-01',
        },
      },
      mockFindEntityById,
    );

    expect(result).toEqual({
      ...processedResponseData,
      data_time: new Date('2022-01-01').toISOString(),
      answers: [],
    });
  });

  it('should add new options to options_created when type is "Autocomplete" and answer is marked as "isNew"', async () => {
    const result = await processSurveyResponse(
      {
        ...responseData,
        questions: [
          {
            questionId: 'question1',
            type: QuestionType.Autocomplete,
            componentNumber: 1,
            text: 'question1',
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
      },
      mockFindEntityById,
    );

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
          question_id: 'question1',
          type: QuestionType.Autocomplete,
          body: 'answer1',
        },
      ],
    });
  });

  it('should not add new options to options_created when type is "Autocomplete" and answer is not marked as "isNew"', async () => {
    const result = await processSurveyResponse(
      {
        ...responseData,
        questions: [
          {
            questionId: 'question1',
            type: QuestionType.Autocomplete,
            componentNumber: 1,
            text: 'question1',
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
      },
      mockFindEntityById,
    );

    expect(result).toEqual({
      ...processedResponseData,
      answers: [
        {
          question_id: 'question1',
          type: QuestionType.Autocomplete,
          body: 'answer1',
        },
      ],
    });
  });

  it('should not add to entities_upserted when type is "Entity" and a create config is not set', async () => {
    const result = await processSurveyResponse(
      {
        ...responseData,
        questions: [
          {
            questionId: 'question1',
            type: QuestionType.Entity,
            componentNumber: 1,
            text: 'question1',
            screenId: 'screen1',
          },
        ],
        answers: {
          question1: 'answer1',
        },
      },
      mockFindEntityById,
    );

    expect(result).toEqual({
      ...processedResponseData,
      answers: [
        {
          question_id: 'question1',
          type: QuestionType.Entity,
          body: 'answer1',
        },
      ],
    });
  });

  it('should add to entities_upserted when type is "Entity" and a create config is set', async () => {
    const result = await processSurveyResponse(
      {
        ...responseData,
        questions: [
          {
            questionId: 'question1',
            type: QuestionType.Entity,
            componentNumber: 1,
            text: 'question1',
            screenId: 'screen1',
            config: {
              entity: {
                createNew: true,
                fields: {
                  code: {
                    questionId: 'question2',
                  },
                },
              },
            },
          },
        ],
        answers: {
          question1: 'answer1',
          question2: 'answer2',
        },
      },
      mockFindEntityById,
    );

    expect(result).toEqual({
      ...processedResponseData,
      answers: [
        {
          question_id: 'question1',
          type: QuestionType.Entity,
          body: 'answer1',
        },
      ],
      entities_upserted: [
        {
          code: 'answer2',
          id: 'answer1',
        },
      ],
    });
  });

  it('should add to qr_codes_to_create when type is "Entity" and a generateQRCode config is set', async () => {
    const result = await processSurveyResponse(
      {
        ...responseData,
        questions: [
          {
            questionId: 'question1',
            type: QuestionType.Entity,
            componentNumber: 1,
            text: 'question1',
            screenId: 'screen1',
            config: {
              entity: {
                createNew: true,
                generateQrCode: true,
                fields: {
                  code: {
                    questionId: 'question2',
                  },
                },
              },
            },
          },
        ],
        answers: {
          question1: 'answer1',
          question2: 'answer2',
        },
      },
      mockFindEntityById,
    );

    expect(result).toEqual({
      ...processedResponseData,
      answers: [
        {
          question_id: 'question1',
          type: QuestionType.Entity,
          body: 'answer1',
        },
      ],
      entities_upserted: [
        {
          code: 'answer2',
          id: 'answer1',
        },
      ],
      qr_codes_to_create: [
        {
          code: 'answer2',
          id: 'answer1',
        },
      ],
    });
  });

  it('should add to entities_upserted when type is "PrimaryEntity" and a create config is set', async () => {
    const result = await processSurveyResponse(
      {
        ...responseData,
        questions: [
          {
            questionId: 'question1',
            type: QuestionType.PrimaryEntity,
            componentNumber: 1,
            text: 'question1',
            screenId: 'screen1',
            config: {
              entity: {
                createNew: true,
                fields: {
                  code: {
                    questionId: 'question2',
                  },
                },
              },
            },
          },
        ],
        answers: {
          question2: 'answer2',
        },
      },
      mockFindEntityById,
    );

    expect(result).toEqual({
      ...processedResponseData,
      entity_id: generateId(),
      answers: [],
      entities_upserted: [
        {
          code: 'answer2',
          id: generateId(),
        },
      ],
    });
  });

  it('should use the country id for new entities if parent id is not filled in', async () => {
    const result = await processSurveyResponse(
      {
        ...responseData,
        questions: [
          {
            questionId: 'question1',
            type: QuestionType.PrimaryEntity,
            componentNumber: 1,
            text: 'question1',
            screenId: 'screen1',
            config: {
              entity: {
                createNew: true,
                fields: {
                  parentId: {
                    questionId: 'question2',
                  },
                },
              },
            },
          },
        ],
        answers: {
          question2: '',
        },
      },
      mockFindEntityById,
    );

    expect(result).toEqual({
      ...processedResponseData,
      entity_id: generateId(),
      answers: [],
      entities_upserted: [
        {
          parent_id: (await mockFindEntityById('theCountryId')).id,
          id: generateId(),
        },
      ],
    });
  });
  it('should handle when question type is File', async () => {
    const result = await processSurveyResponse(
      {
        ...responseData,
        questions: [
          {
            questionId: 'question1',
            type: QuestionType.File,
            componentNumber: 1,
            text: 'question1',
            screenId: 'screen1',
          },
        ],
        answers: {
          question1: {
            value: 'theEncodedFile',
            name: 'theFileName',
          },
        },
      },
      mockFindEntityById,
    );

    expect(result).toEqual({
      ...processedResponseData,
      answers: [
        {
          question_id: 'question1',
          type: QuestionType.File,
          body: {
            data: 'theEncodedFile',
            uniqueFileName: getUniqueSurveyQuestionFileName('theFileName'),
          },
        },
      ],
    });
  });
});
