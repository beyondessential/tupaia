/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { TaskCompletionHandler } from '../../changeHandlers';
import {
  buildAndInsertSurveys,
  findOrCreateDummyRecord,
  getTestModels,
  populateTestData,
  upsertDummyRecord,
} from '../../testUtilities';
import { generateId } from '../../utilities';

const buildSurvey = () => {
  const code = 'Test_survey';

  return {
    id: generateId(),
    code,
    questions: [{ code: `${code}1`, type: 'Number' }],
  };
};

const userId = generateId();

const SURVEY = buildSurvey();

describe('TaskCompletionHandler', () => {
  const models = getTestModels();
  const taskCompletionHandler = new TaskCompletionHandler(models);
  taskCompletionHandler.setDebounceTime(50); // short debounce time so tests run more quickly

  const createResponses = async data => {
    const { surveyResponses } = await populateTestData(models, {
      surveyResponse: data.map(({ date, ...otherFields }) => {
        // append time if required
        const datetime = date ?? `${date}T12:00:00`.slice(0, 'YYYY-MM-DDThh:mm:ss'.length);

        return {
          start_time: datetime,
          end_time: datetime,
          data_time: datetime,
          user_id: userId,
          survey_id: SURVEY.id,
          id: generateId(),
          ...otherFields,
        };
      }),
    });

    return surveyResponses.map(sr => sr.id);
  };

  const assertTaskStatus = async (taskId, expectedStatus, expectedSurveyResponseId) => {
    await models.database.waitForAllChangeHandlers();
    const task = await models.task.findById(taskId);

    expect(task.status).toBe(expectedStatus);
    expect(task.survey_response_id).toBe(expectedSurveyResponseId);
  };

  let tonga;
  let task;

  beforeAll(async () => {
    await buildAndInsertSurveys(models, [SURVEY]);
    tonga = await findOrCreateDummyRecord(models.entity, { code: 'TO' });
    task = await findOrCreateDummyRecord(models.task, {
      entity_id: tonga.id,
      survey_id: SURVEY.id,
      created_at: '2024-07-08',
      status: 'to_do',
      due_date: new Date('2024-07-20').getTime(),
      survey_response_id: null,
    });
    await upsertDummyRecord(models.user, { id: userId });
  });

  beforeEach(async () => {
    taskCompletionHandler.listenForChanges();
  });

  afterEach(async () => {
    taskCompletionHandler.stopListeningForChanges();
    await models.surveyResponse.delete({ survey_id: SURVEY.id });
    await models.task.update({ id: task.id }, { status: 'to_do', survey_response_id: null });
  });

  describe('creating a survey response', () => {
    it('created response marks associated tasks as completed if created_time < data_time, and links survey response IDs to the task', async () => {
      const responseIds = await createResponses([
        { entity_id: tonga.id, date: '2024-07-20' },
        { entity_id: tonga.id, date: '2024-07-21' },
      ]);
      await assertTaskStatus(task.id, 'completed', responseIds[0]);
      const comments = await models.taskComment.find({ task_id: task.id });
      expect(comments[0]).toMatchObject({
        message: 'Completed this task',
        user_id: userId,
        type: models.taskComment.types.System,
      });
    });

    it('created response marks associated tasks as completed if created_time === data_time', async () => {
      const responseIds = await createResponses([{ entity_id: tonga.id, date: '2024-07-08' }]);
      await assertTaskStatus(task.id, 'completed', responseIds[0]);
    });

    it('created response does not mark associated tasks as completed if created_time > data_time', async () => {
      await createResponses([{ entity_id: tonga.id, date: '2021-07-08' }]);
      await assertTaskStatus(task.id, 'to_do', null);
    });

    it('created response does not mark associated tasks as completed if status is null, but should still create a comment', async () => {
      await models.task.update({ id: task.id }, { status: null });
      await createResponses([{ entity_id: tonga.id, date: '2021-07-08' }]);
      await assertTaskStatus(task.id, null, null);
      const comments = await models.taskComment.find({ task_id: task.id });
      expect(comments[0]).toMatchObject({
        message: 'Completed this task',
        user_id: userId,
        type: 'system',
      });
    });
  });

  describe('updating a survey response', () => {
    it('updating a survey response does not mark a task as completed', async () => {
      await createResponses([{ entity_id: tonga.id, date: '2021-07-20' }]);
      await models.surveyResponse.update({ entity_id: tonga.id }, { data_time: '2024-07-25' });
      await assertTaskStatus(task.id, 'to_do', null);
    });
  });

  describe('Repeating tasks', () => {
    it('creating a survey response for a repeating task creates a new completed task', async () => {
      const samoa = await findOrCreateDummyRecord(models.entity, { code: 'WS' });
      const repeatTask = await findOrCreateDummyRecord(models.task, {
        entity_id: samoa.id,
        survey_id: SURVEY.id,
        created_at: '2024-07-08',
        status: null,
        repeat_schedule: {
          frequency: 'daily',
        },
      });

      const responses = await createResponses([{ entity_id: samoa.id, date: '2024-07-20' }]);
      // Check that the repeat task has stayed as is
      await assertTaskStatus(repeatTask.id, null, null);

      const newTask = await models.task.findOne({
        survey_response_id: responses[0],
        entity_id: samoa.id,
        parent_task_id: repeatTask.id,
      });
      await assertTaskStatus(newTask.id, 'completed', responses[0]);
    });

    it('creating a survey response for a repeating task with status to_do creates a new completed task', async () => {
      const fiji = await findOrCreateDummyRecord(models.entity, { code: 'FJ' });
      const repeatTask = await findOrCreateDummyRecord(models.task, {
        entity_id: fiji.id,
        survey_id: SURVEY.id,
        created_at: '2024-07-08',
        status: 'to_do',
        repeat_schedule: {
          frequency: 'daily',
        },
      });

      const responses = await createResponses([{ entity_id: fiji.id, date: '2024-07-20' }]);
      // Check that the repeat task has stayed as is
      await assertTaskStatus(repeatTask.id, 'to_do', null);
      const newTask = await models.task.findOne({
        survey_response_id: responses[0],
        entity_id: fiji.id,
        parent_task_id: repeatTask.id,
      });
      await assertTaskStatus(newTask.id, 'completed', responses[0]);
    });
  });
});
