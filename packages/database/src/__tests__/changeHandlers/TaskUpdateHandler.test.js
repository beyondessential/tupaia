import { TaskUpdateHandler } from '../../server/changeHandlers';
import {
  buildAndInsertSurvey,
  buildAndInsertSurveyResponses,
  findOrCreateDummyRecord,
  getTestModels,
  upsertDummyRecord,
} from '../../server/testUtilities';
import { generateId } from '../../core/utilities';

const userId = generateId();
const initialEntityId = generateId();
const initialEntityCode = 'TO_1';
const newEntityId = generateId();
const newEntityCode = 'TO_2';
const taskSurveyId = generateId();
const taskSurveyCode = 'TEST_TASK_SURVEY';

const buildEntities = async (models, data) => {
  await upsertDummyRecord(models.entity, { id: initialEntityId, code: initialEntityCode, ...data });
  await upsertDummyRecord(models.entity, { id: newEntityId, code: newEntityCode, ...data });
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
    entityCode: initialEntityCode,
    surveyCode,
    answers,
    id: generateId(),
    timezone: 'Pacific/Auckland',
  };

  const surveyResponses = await buildAndInsertSurveyResponses(models, [surveyResponse]);
  return surveyResponses[0];
};

describe('TaskUpdateHandler', () => {
  const models = getTestModels();
  const taskUpdateHandler = new TaskUpdateHandler(models);
  taskUpdateHandler.setDebounceTime(50); // short debounce time so tests run more quickly
  let surveyResponse;
  let task;

  beforeAll(async () => {
    await buildEntities(models);
    await buildAndInsertSurvey(models, { id: taskSurveyId, code: taskSurveyCode });
    await upsertDummyRecord(models.user, { id: userId });
    const { survey } = await buildTaskCreationSurvey(models, {
      task: {
        surveyCode: taskSurveyCode,
        entityId: { questionId: 'TEST_ID_00' },
        shouldCreateTask: { questionId: 'TEST_ID_01' },
        dueDate: { questionId: 'TEST_ID_02' },
        assignee: { questionId: 'TEST_ID_03' },
      },
    });
    const surveyResponseResult = await buildSurveyResponse(models, survey?.code, {
      TEST_CODE_00: initialEntityId,
      TEST_CODE_01: 'Yes',
      // answers come in iso format
      TEST_CODE_02: new Date('2024-06-06 00:00:00+12:00').toISOString(),
      TEST_CODE_03: userId,
    });
    surveyResponse = surveyResponseResult.surveyResponse;
    task = await findOrCreateDummyRecord(models.task, {
      initial_request_id: surveyResponse.id,
      survey_id: taskSurveyId,
      entity_id: initialEntityId,
    });
  });

  beforeEach(async () => {
    taskUpdateHandler.listenForChanges();
    await models.surveyResponse.update(
      {
        entity_id: newEntityId,
      },
      { entity_id: initialEntityId },
    );
    await models.task.update(
      {
        id: task?.id,
      },
      { status: 'to_do', entity_id: initialEntityId },
    );
  });

  afterEach(async () => {
    taskUpdateHandler.stopListeningForChanges();
  });

  it('Updates a task entity_id when a survey response is updated with a new entity_id', async () => {
    await models.surveyResponse.updateById(surveyResponse.id, { entity_id: newEntityId });
    await models.database.waitForAllChangeHandlers();

    const afterTask = await models.task.findOne({ initial_request_id: surveyResponse.id });
    expect(afterTask.entity_id).toEqual(newEntityId);
  });

  it('Does not update a task entity id if the task is already completed', async () => {
    await models.task.update(
      {
        initial_request_id: surveyResponse.id,
      },
      { status: 'completed' },
    );
    await models.surveyResponse.update(
      {
        entity_id: initialEntityId,
      },
      {
        entity_id: newEntityId,
      },
    );
    await models.database.waitForAllChangeHandlers();
    const afterTask = await models.task.findOne({ initial_request_id: surveyResponse.id });
    expect(afterTask.entity_id).toEqual(initialEntityId);
  });
});
