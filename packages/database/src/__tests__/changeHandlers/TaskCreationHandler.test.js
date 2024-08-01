/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { TaskCreationHandler } from '../../changeHandlers';
import {
  buildAndInsertSurvey,
  buildAndInsertSurveyResponses,
  getTestModels,
  upsertDummyRecord,
} from '../../testUtilities';
import { generateId } from '../../utilities';

const userId = generateId();
const entityId = generateId();
const entityCode = 'TO';
const taskSurveyId = generateId();
const taskSurveyCode = 'TEST_TASK_SURVEY';

const buildEntity = async (models, data) => {
  return upsertDummyRecord(models.entity, { id: entityId, code: entityCode, ...data });
};
const buildTaskCreationSurvey = async (models, config) => {
  const survey = {
    id: generateId(),
    code: generateId(),
    questions: [
      {
        id: 'TEST_ID_00',
        code: 'TEST_CODE_00',
        type: 'PrimaryEntity',
      },
      {
        id: 'TEST_ID_01',
        code: 'TEST_CODE_01',
        type: 'Binary',
      },
      {
        id: 'TEST_ID_02',
        code: 'TEST_CODE_02',
        type: 'Date',
      },
      {
        id: 'TEST_ID_03',
        code: 'TEST_CODE_03',
        type: 'FreeText',
      },
      {
        id: 'TEST_ID_04',
        code: 'TEST_CODE_04',
        type: 'Task',
        surveyScreenComponent: {
          config,
        },
      },
      {
        id: 'TEST_ID_05',
        code: 'TEST_CODE_05',
        type: 'Task',
        surveyScreenComponent: {
          config,
        },
      },
    ],
  };

  await Promise.all(
    survey.questions.map(q => {
      return upsertDummyRecord(models.question, q);
    }),
  );

  return buildAndInsertSurvey(models, survey);
};

const buildSurveyResponse = async (models, surveyCode, answers) => {
  const surveyResponse = {
    date: '2024-07-20',
    entityCode,
    surveyCode,
    answers,
  };

  const surveyResponses = await buildAndInsertSurveyResponses(models, [surveyResponse]);
  return surveyResponses[0];
};

const TEST_DATA = [
  [
    'Sets task values based on configured question values',
    {
      config: {
        task: {
          surveyCode: taskSurveyCode,
          entityId: { questionId: 'TEST_ID_00' },
          shouldCreateTask: { questionId: 'TEST_ID_01' },
          dueDate: { questionId: 'TEST_ID_02' },
          assignee: { questionId: 'TEST_ID_03' },
        },
      },
      answers: {
        TEST_CODE_00: entityId,
        TEST_CODE_01: true,
        TEST_CODE_02: '2024/06/06 00:00:00+00',
        TEST_CODE_03: userId,
      },
    },
    {
      survey_id: taskSurveyId,
      due_date: '2024-06-06 00:00:00',
      assignee_id: userId,
      entity_id: entityId,
    },
  ],
  [
    'Handles optional and missing values',
    {
      config: {
        task: {
          surveyCode: taskSurveyCode,
          entityId: { questionId: 'TEST_ID_00' },
        },
      },
      answers: {
        TEST_CODE_00: entityId,
      },
    },
    { entity_id: entityId, survey_id: taskSurveyId },
  ],
];

describe('TaskCreationHandler', () => {
  const models = getTestModels();
  const taskCreationHandler = new TaskCreationHandler(models);
  taskCreationHandler.setDebounceTime(50); // short debounce time so tests run more quickly

  beforeAll(async () => {
    await buildEntity(models);
    await buildAndInsertSurvey(models, { id: taskSurveyId, code: taskSurveyCode });
    await upsertDummyRecord(models.user, { id: userId });
  });

  beforeEach(async () => {
    taskCreationHandler.listenForChanges();
  });

  afterEach(async () => {
    taskCreationHandler.stopListeningForChanges();
    await models.surveyResponse.delete({ survey_id: taskSurveyId });
  });

  it.each(TEST_DATA)('%s', async (_name, { config, answers = {} }, result) => {
    const { survey } = await buildTaskCreationSurvey(models, config);
    await buildSurveyResponse(models, survey.code, answers);
    await models.database.waitForAllChangeHandlers();
    const tasks = await models.task.find({ entity_id: entityId }, { sort: ['created_at DESC'] });

    const { survey_id, entity_id, status, due_date, assignee_id, repeat_schedule } = tasks[0];

    expect({
      survey_id,
      entity_id,
      assignee_id,
      due_date,
      status,
      repeat_schedule,
    }).toMatchObject({
      repeat_schedule: null,
      due_date: null,
      status: 'to_do',
      ...result,
    });
  });

  it('Does not create a task if shouldCreateTask is false', async () => {
    const beforeTasks = await models.task.find({ survey_id: taskSurveyId });
    const { survey } = await buildTaskCreationSurvey(models, { shouldCreateTask: 'TEST_01' });
    await buildSurveyResponse(models, survey.code, { TEST_01: false });
    await models.database.waitForAllChangeHandlers();
    const afterTasks = await models.task.find({ survey_id: taskSurveyId });
    expect(beforeTasks.length).toEqual(afterTasks.length);
  });
});
