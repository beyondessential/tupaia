import { TaskAssigneeEmailer } from '../../changeHandlers';
import {
  buildAndInsertSurvey,
  findOrCreateDummyRecord,
  getTestModels,
  upsertDummyRecord,
} from '../../testUtilities';
import { generateId } from '../../utilities';

const USER = {
  first_name: 'Test',
  last_name: 'User',
  email: 'test@email.com',
  id: generateId(),
};
const ENTITY = {
  name: 'Test Entity',
  code: 'TEST_ENTITY',
  id: generateId(),
};

const SURVEY = {
  name: 'Test Survey',
  code: 'TEST_TASK_SURVEY',
  id: generateId(),
};

const TASK = {
  survey_id: SURVEY.id,
  entity_id: ENTITY.id,
  status: 'to_do',
  repeat_schedule: null,
  assignee_id: null,
  due_date: new Date('2021-01-01 00:00:00').getTime(),
  id: generateId(),
};

describe('TaskAssigneeEmailer', () => {
  const models = getTestModels();
  const taskAssigneeEmailer = new TaskAssigneeEmailer(models);
  taskAssigneeEmailer.setDebounceTime(50); // short debounce time so tests run more quickly
  let task;

  beforeAll(async () => {
    await upsertDummyRecord(models.entity, ENTITY);
    await buildAndInsertSurvey(models, SURVEY);
    await upsertDummyRecord(models.user, USER);
    task = await findOrCreateDummyRecord(models.task, TASK);
  });

  beforeEach(async () => {
    taskAssigneeEmailer.listenForChanges();
  });

  afterEach(async () => {
    taskAssigneeEmailer.stopListeningForChanges();
    await models.task.updateById(task.id, { assignee_id: null });
  });

  describe('handleChanges', () => {
    it('Succeeds when entityId, surveyId, and assigneeId are valid ids', async () => {
      await expect(async () =>
        taskAssigneeEmailer.handleChanges(models, [
          {
            ...task,
            assignee_id: USER.id,
          },
        ]),
      ).not.toThrow();
    });

    it('Throws an error when assigneeId is not valid', async () => {
      await expect(async () =>
        taskAssigneeEmailer.handleChanges(models, [
          {
            ...task,
            assignee_id: 'invalid id',
          },
        ]),
      ).rejects.toThrow('No user found with ID invalid id');
    });

    it('Throws an error when entityId is not valid', async () => {
      await expect(async () =>
        taskAssigneeEmailer.handleChanges(models, [
          {
            ...task,
            assignee_id: USER.id,
            entity_id: 'invalid id',
          },
        ]),
      ).rejects.toThrow('No entity found with ID invalid id');
    });

    it('Throws an error when surveyId is not valid', async () => {
      await expect(async () =>
        taskAssigneeEmailer.handleChanges(models, [
          {
            ...task,
            assignee_id: USER.id,
            survey_id: 'invalid id',
          },
        ]),
      ).rejects.toThrow('No survey found with ID invalid id');
    });
  });

  describe('getUpdatedTasks', () => {
    it('Ignores tasks when the change type is not `update`', () => {
      expect(taskAssigneeEmailer.getUpdatedTasks({ type: 'delete', old_record: TASK })).toEqual([]);
    });

    it('Ignores tasks when the assignee_id is not set on the new record', () => {
      expect(taskAssigneeEmailer.getUpdatedTasks({ type: 'update', new_record: TASK })).toEqual([]);
    });

    it('Ignores tasks when the assignee_id is the same as the old assignee_id', () => {
      expect(
        taskAssigneeEmailer.getUpdatedTasks({
          type: 'update',
          new_record: {
            ...TASK,
            assignee_id: USER.id,
          },
          old_record: {
            ...TASK,
            assignee_id: USER.id,
          },
        }),
      ).toEqual([]);
    });

    it('Returns tasks when the assignee_id is set on new records and there is no old record', () => {
      expect(
        taskAssigneeEmailer.getUpdatedTasks({
          type: 'update',
          new_record: {
            ...TASK,
            assignee_id: USER.id,
          },
        }),
      ).toEqual([
        {
          ...TASK,
          assignee_id: USER.id,
        },
      ]);
    });

    it('Returns tasks when the assignee_id is has changed from the old record', () => {
      expect(
        taskAssigneeEmailer.getUpdatedTasks({
          type: 'update',
          new_record: {
            ...TASK,
            assignee_id: USER.id,
          },
          old_record: TASK,
        }),
      ).toEqual([
        {
          ...TASK,
          assignee_id: USER.id,
        },
      ]);
    });
  });
});
