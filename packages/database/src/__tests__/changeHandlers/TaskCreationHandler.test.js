/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { TaskCreationHandler } from '../../changeHandlers';
import {
  buildAndInsertSurveyResponses,
  buildAndInsertSurveys,
  findOrCreateDummyRecord,
  getTestModels,
  populateTestData,
  upsertDummyRecord,
} from '../../testUtilities';
import { generateId } from '../../utilities';

const userId = generateId();
const entityId = generateId();
const surveyId = generateId();

const SURVEY = {
  id: surveyId,
  code: 'TEST_SURVEY',
  questions: [
    {
      code: 'TEST_00',
      type: 'PrimaryEntity',
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
        config: { surveyCode: 'ASSET_REPAIR', dueDate: 'TEST_02', assignee: 'TEST_03' },
      },
    },
  ],
};

const SURVEY_RESPONSE = {
  entity_id: entityId,
  date: '2024-07-20',
  answers: [
    { questionCode: 'TEST_03', text: userId },
    { questionCode: 'TEST_02', text: '2024/06/06' },
  ],
};

describe('TaskCreationHandler', () => {
  const models = getTestModels();
  const taskCreationHandler = new TaskCreationHandler(models);
  taskCreationHandler.setDebounceTime(50); // short debounce time so tests run more quickly

  beforeAll(async () => {
    await buildAndInsertSurveys(models, [SURVEY]);
    await findOrCreateDummyRecord(models.entity, { id: entityId, code: 'TO' });
    await upsertDummyRecord(models.user, { id: userId });
  });

  beforeEach(async () => {
    taskCreationHandler.listenForChanges();
  });

  afterEach(async () => {
    taskCreationHandler.stopListeningForChanges();
    await models.surveyResponse.delete({ survey_id: SURVEY.id });
  });

  it('Creating a task from a survey response', async () => {
    await buildAndInsertSurveyResponses(models, [SURVEY_RESPONSE]);

    await models.database.waitForAllChangeHandlers();
    const task = await models.task.findOne({ survey_id: surveyId });
    console.log('TASK', task);

    expect(task.status).toBe('to_do');
  });
});
