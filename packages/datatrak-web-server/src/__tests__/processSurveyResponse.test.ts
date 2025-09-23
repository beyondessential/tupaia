import { generateId, SurveyResponseModel } from '@tupaia/database';
import { QuestionType } from '@tupaia/types';
import { getUniqueSurveyQuestionFileName } from '@tupaia/utils';
import { DatatrakWebServerModelRegistry } from '../types';

const mockFindEntityById = async (_id: string) => ({
  id: 'theEntityId',
  code: 'theEntityCode',
  name: 'The Entity Name',
  type: 'facility',
});

const optionSetId = 'optionSetId';

const mockModels = {
  entity: {
    findById: mockFindEntityById,
  },
  option: {
    findOne: async ({ value }: { value: any }) => (value === '2' ? { value } : null),
  },
} as DatatrakWebServerModelRegistry;

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
    timezone: 'Pacific/Auckland',
  };

  const processedResponseData = {
    survey_id: 'theSurveyId',
    user_id: 'theUserId',
    start_time: 'theStartTime',
    data_time: timestamp,
    entity_id: 'theCountryId',
    end_time: timestamp,
    timestamp: timestamp,
    timezone: 'Pacific/Auckland',
    options_created: [],
    entities_upserted: [],
    qr_codes_to_create: [],
    recent_entities: [],
  };

  it('should process the survey response with standard question types', async () => {
    const result = await SurveyResponseModel.processSurveyResponse(mockModels, {
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
        {
          questionId: 'question3',
          type: QuestionType.User,
          text: 'question3',
          screenId: 'screen3',
          componentNumber: 3,
        },
      ],
      answers: {
        question1: 'answer1',
        question2: 'answer2',
        question3: {
          id: 'theUserId',
          name: 'theUserName',
        },
      },
    });

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
        {
          question_id: 'question3',
          type: QuestionType.User,
          body: 'theUserId',
        },
      ],
    });
  });

  it('should set the entity_id as the answer when question type is "PrimaryEntity"', async () => {
    const result = await SurveyResponseModel.processSurveyResponse(mockModels, {
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
    });

    expect(result).toEqual({
      ...processedResponseData,
      entity_id: 'answer1',
      answers: [],
      recent_entities: ['answer1'],
    });
  });

  it('should set the data_time as the answer when question type is "DateOfData"', async () => {
    const result = await SurveyResponseModel.processSurveyResponse(mockModels, {
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
        question1: '2022-01-01T00:00',
      },
    });

    expect(result).toEqual({
      ...processedResponseData,
      data_time: '2022-01-01T00:00+13:00',
      answers: [],
    });
  });

  it('should set the data_time as the answer when question type is "SubmissionDate"', async () => {
    const result = await SurveyResponseModel.processSurveyResponse(mockModels, {
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
        question1: '2022-01-01T00:00',
      },
    });

    expect(result).toEqual({
      ...processedResponseData,
      data_time: '2022-01-01T00:00+13:00',
      answers: [],
    });
  });

  it('should add new options to options_created when type is "Autocomplete" and answer not in the optionSet', async () => {
    const result = await SurveyResponseModel.processSurveyResponse(mockModels, {
      ...responseData,
      questions: [
        {
          questionId: 'question1',
          code: 'question1',
          type: QuestionType.Autocomplete,
          componentNumber: 1,
          text: 'question1',
          screenId: 'screen1',
          optionSetId,
          config: { autocomplete: { createNew: true } },
        },
      ],
      answers: {
        question1: '3',
      },
    });

    expect(result).toEqual({
      ...processedResponseData,
      options_created: [
        {
          option_set_id: optionSetId,
          value: '3',
          label: '3',
        },
      ],
      answers: [
        {
          question_id: 'question1',
          type: QuestionType.Autocomplete,
          body: '3',
        },
      ],
    });
  });

  it('should not add new options to options_created when type is "Autocomplete" and answer is in the optionSet', async () => {
    const result = await SurveyResponseModel.processSurveyResponse(mockModels, {
      ...responseData,
      questions: [
        {
          questionId: 'question1',
          code: 'question1',
          type: QuestionType.Autocomplete,
          componentNumber: 1,
          text: 'question1',
          screenId: 'screen1',
          optionSetId,
          config: {},
        },
      ],
      answers: {
        question1: '2',
      },
    });

    expect(result).toEqual({
      ...processedResponseData,
      options_created: [],
      answers: [
        {
          question_id: 'question1',
          type: QuestionType.Autocomplete,
          body: '2',
        },
      ],
    });
  });

  it('should throw an error when type is "Autocomplete" and answer is not in the optionSet but createNew is not true', async () => {
    await expect(() =>
      SurveyResponseModel.processSurveyResponse(mockModels, {
        ...responseData,
        questions: [
          {
            questionId: 'question1',
            code: 'question1',
            type: QuestionType.Autocomplete,
            componentNumber: 1,
            text: 'question1',
            screenId: 'screen1',
            optionSetId,
            config: {},
          },
        ],
        answers: {
          question1: '3',
        },
      }),
    ).rejects.toThrow('Cannot create new options for question: question1');
  });

  it('should not add to entities_upserted when type is "Entity" and a create config is not set', async () => {
    const result = await SurveyResponseModel.processSurveyResponse(mockModels, {
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
    });

    expect(result).toEqual({
      ...processedResponseData,
      answers: [
        {
          question_id: 'question1',
          type: QuestionType.Entity,
          body: 'answer1',
        },
      ],
      recent_entities: ['answer1'],
    });
  });

  it('should add to entities_upserted when type is "Entity" and a create config is set', async () => {
    const result = await SurveyResponseModel.processSurveyResponse(mockModels, {
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
    });

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
      recent_entities: ['answer1'],
    });
  });

  it('should add to qr_codes_to_create when type is "Entity" and a generateQRCode config is set', async () => {
    const result = await SurveyResponseModel.processSurveyResponse(mockModels, {
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
    });

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
      recent_entities: ['answer1'],
    });
  });

  it('should add to entities_upserted when type is "PrimaryEntity" and a create config is set', async () => {
    const result = await SurveyResponseModel.processSurveyResponse(mockModels, {
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
    });

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
      recent_entities: [generateId()],
    });
  });

  it('should not add to recent_entities when type is entity question and is not filled in', async () => {
    const result = await SurveyResponseModel.processSurveyResponse(mockModels, {
      ...responseData,
      questions: [
        {
          questionId: 'question1',
          type: QuestionType.Entity,
          componentNumber: 1,
          text: 'question1',
          screenId: 'screen1',
          config: {},
        },
      ],
      answers: {},
    });

    expect(result.recent_entities).toEqual([]);
  });

  it('throw an error when type is primary entity question and is not filled in', async () => {
    try {
      void (await SurveyResponseModel.processSurveyResponse(mockModels, {
        ...responseData,
        questions: [
          {
            questionId: 'question1',
            type: QuestionType.PrimaryEntity,
            componentNumber: 1,
            text: 'question1',
            screenId: 'screen1',
            config: {},
          },
        ],
        answers: {},
      }));
    } catch (error: any) {
      expect(error.message).toBe('Primary Entity question is a required field');
    }
  });

  it('should use the country id for new entities if parent id is not filled in', async () => {
    const result = await SurveyResponseModel.processSurveyResponse(mockModels, {
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
    });

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
      recent_entities: [generateId()],
    });
  });
  it('should handle when question type is File', async () => {
    const result = await SurveyResponseModel.processSurveyResponse(mockModels, {
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
          value: 'data://theEncodedFile',
          name: 'theFileName',
        },
      },
    });

    expect(result).toEqual({
      ...processedResponseData,
      answers: [
        {
          question_id: 'question1',
          type: QuestionType.File,
          body: {
            data: 'data://theEncodedFile',
            uniqueFileName: getUniqueSurveyQuestionFileName('theFileName'),
          },
        },
      ],
    });
  });

  it('should handle when question type is File and the file is not an encoded file', async () => {
    const result = await SurveyResponseModel.processSurveyResponse(mockModels, {
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
          value: 'filename.png',
          name: 'theFileName',
        },
      },
    });

    expect(result).toEqual({
      ...processedResponseData,
      answers: [
        {
          question_id: 'question1',
          type: QuestionType.File,
          body: 'filename.png',
        },
      ],
    });
  });

  it('should add the timezone offset when question type is Date', async () => {
    const result = await SurveyResponseModel.processSurveyResponse(mockModels, {
      ...responseData,
      questions: [
        {
          questionId: 'question1',
          type: QuestionType.Date,
          componentNumber: 1,
          text: 'question1',
          screenId: 'screen1',
        },
      ],
      answers: {
        question1: '2022-01-01T00:00',
      },
    });

    expect(result).toEqual({
      ...processedResponseData,
      answers: [
        {
          question_id: 'question1',
          type: QuestionType.Date,
          body: '2022-01-01T00:00+13:00',
        },
      ],
    });
  });

  it('should add the timezone offset when question type is DateTime', async () => {
    const result = await SurveyResponseModel.processSurveyResponse(mockModels, {
      ...responseData,
      questions: [
        {
          questionId: 'question1',
          type: QuestionType.DateTime,
          componentNumber: 1,
          text: 'question1',
          screenId: 'screen1',
        },
      ],
      answers: {
        question1: '2022-01-01T00:00',
      },
    });

    expect(result).toEqual({
      ...processedResponseData,
      answers: [
        {
          question_id: 'question1',
          type: QuestionType.DateTime,
          body: '2022-01-01T00:00+13:00',
        },
      ],
    });
  });
});
