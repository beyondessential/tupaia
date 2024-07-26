/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { expect } from 'chai';
import {
  buildAndInsertSurvey,
  buildAndInsertSurveyResponses,
  getTestModels,
  upsertDummyRecord,
  generateId,
} from '@tupaia/database';
import { TaskCreationHandler } from '../../changeHandlers/TaskCreationHandler';

const userId = generateId();
const entityId = generateId();
const taskSurveyId = generateId();
const taskSurveyCode = 'TEST_TASK_SURVEY';

const buildEntity = async (models, data) => {
  return upsertDummyRecord(models.entity, { id: entityId, ...data });
};
const buildTaskCreationSurvey = async (models, config) => {
  const survey = {
    id: generateId(),
    code: generateId(),
    questions: [
      {
        code: 'TEST_00',
        type: 'PrimaryEntity',
      },
      {
        code: 'TEST_01',
        type: 'Binary',
      },
      {
        code: 'TEST_02',
        type: 'Date',
      },
      {
        code: 'TEST_03',
        type: 'FreeText',
      },
      {
        code: 'TEST_04',
        type: 'Task',
        surveyScreenComponent: {
          config,
        },
      },
    ],
  };

  return buildAndInsertSurvey(models, survey);
};

const buildSurveyResponse = async (models, surveyCode, answers) => {
  const surveyResponse = {
    date: '2024-07-20',
    entityCode: 'TO',
    surveyCode,
    answers,
  };

  const surveyResponses = await buildAndInsertSurveyResponses(models, [surveyResponse]);
  return surveyResponses[0];
};

const TEST_DATA = [
  [
    'Creates a task when shouldCreateTask is true',
    {
      config: {
        shouldCreateTask: true,
        surveyCode: taskSurveyCode,
        assignee: userId,
        entityId,
      },
    },
    { entity_id: entityId, assignee_id: userId, survey_id: taskSurveyId },
  ],
  [
    'Sets task values based on configured question values',
    {
      config: {
        surveyCode: taskSurveyCode,
        entityId: 'TEST_00',
        shouldCreateTask: 'TEST_01',
        dueDate: 'TEST_02',
        assignee: 'TEST_03',
      },
      answers: {
        TEST_00: entityId,
        TEST_01: true,
        TEST_02: '2024/06/06 00:00:00+00',
        TEST_03: userId,
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
    'Sets task values based on configured string values',
    {
      config: {
        surveyCode: taskSurveyCode,
        entityId,
        shouldCreateTask: true,
        dueDate: '2024-06-06 00:00:00+00',
        assignee: userId,
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
        surveyCode: taskSurveyCode,
        entityId,
      },
    },
    { entity_id: entityId, survey_id: taskSurveyId },
  ],
];

describe('TaskCreationHandler', () => {
  const models = getTestModels();
  const taskCreationHandler = new TaskCreationHandler(models);
  taskCreationHandler.setDebounceTime(50); // short debounce time so tests run more quickly

  before(async () => {
    await buildEntity(models);
    await buildAndInsertSurvey(models, { id: taskSurveyId, code: taskSurveyCode });
    await upsertDummyRecord(models.user, { id: userId });
  });

  beforeEach(async () => {
    taskCreationHandler.listenForChanges();
  });

  afterEach(async () => {
    taskCreationHandler.stopListeningForChanges();
  });

  TEST_DATA.forEach(([name, { config, answers = {} }, result]) => {
    it(name, async () => {
      const { survey } = await buildTaskCreationSurvey(models, config);
      const { surveyResponse } = await buildSurveyResponse(models, survey.code, answers);
      await models.database.waitForAllChangeHandlers();
      const task = await models.task.findOne({ survey_response_id: surveyResponse.id });

      expect(task).to.containSubset({
        repeat_schedule: null,
        due_date: null,
        survey_response_id: surveyResponse.id,
        status: 'to_do',
        ...result,
      });
    });
  });

  it('Does not create a task if shouldCreateTask is false', async () => {
    const { survey } = await buildTaskCreationSurvey(models, { shouldCreateTask: 'TEST_01' });
    const { surveyResponse } = await buildSurveyResponse(models, survey.code, { TEST_01: false });
    await models.database.waitForAllChangeHandlers();
    const task = await models.task.findOne({ survey_response_id: surveyResponse.id });

    expect(task).to.equal(null);
  });
});
