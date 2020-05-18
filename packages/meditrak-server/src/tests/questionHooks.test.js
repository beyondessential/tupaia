import { expect } from 'chai';
import { upsertDummyRecord } from '@tupaia/database';

import { TestableApp } from './TestableApp';
import { registerHook } from '../hooks';

const ENTITY_ID = 'test-hook-entity-0000000';

describe('Question hooks', () => {
  const app = new TestableApp();
  const models = app.models;
  const database = models.database;

  const questionCode = num => `TEST-${num}`;

  let testSurvey = null;
  let testSurveyScreen = null;

  const createHookSpy = name => {
    // register the hook
    const spy = { called: false, params: null };
    registerHook(name, params => {
      spy.called = true;
      spy.params = params;
    });
    return spy;
  };

  const makeQuestion = async (code, type, hook) => {
    const q = await models.question.create({
      code: questionCode(code),
      text: questionCode(code),
      type: type || code,
      hook,
    });

    // add it to a survey screen
    await models.surveyScreenComponent.create({
      screen_id: testSurveyScreen.id,
      question_id: q.id,
      component_number: 1,
    });

    return q;
  };

  before(async () => {
    await app.authenticate();

    testSurvey = await models.survey.create({
      id: 'question_hook_surve_test',
      code: 'test-question-hook-survey',
      name: 'Question hooks test survey',
    });

    const country = await upsertDummyRecord(models.country);
    const geographicalArea = await upsertDummyRecord(models.geographicalArea, {
      country_id: country.id,
    });
    await models.facility.create({
      id: 'question_hook_00000_test',
      name: 'Test question hook clinic',
      code: 'test-question-hook-clinic',
      geographical_area_id: geographicalArea.id,
      country_id: geographicalArea.country_id,
    });

    await models.entity.create({
      id: ENTITY_ID,
      code: ENTITY_ID,
      name: 'test entity',
      type: models.entity.types.FACILITY,
    });

    testSurveyScreen = await models.surveyScreen.create({
      id: 'hooks_survey_screen_test',
      survey_id: testSurvey.id,
      screen_number: 1,
    });

    await makeQuestion('test', 'Text', 'testHook');
    await makeQuestion('geo', 'Geolocate', 'entityCoordinates');
    await makeQuestion('image', 'Text', 'entityImage');
    await makeQuestion('backdate-test', 'Text', 'backdateTestHook');

    await makeQuestion('whole-survey-a', 'Text', 'wholeSurvey');
    await makeQuestion('whole-survey-b', 'Text');
  });

  describe('Basic functionality', () => {
    it('Should call the hook for a machine submission', async () => {
      const spy = createHookSpy('testHook');

      // submit a survey response
      const response = await app.post('surveyResponse', {
        body: {
          survey_id: testSurvey.id,
          entity_id: ENTITY_ID,
          timestamp: 123,
          answers: {
            [questionCode('test')]: 'CHECK',
          },
        },
      });

      await database.waitForAllChangeHandlers();

      // expect the hook to have been called
      expect(spy.called).to.be.true;
      expect(spy.params.surveyResponse.entity_id).to.equal(ENTITY_ID);
    });

    it('Should have access to the whole survey response', async () => {
      let answerValues = null;
      registerHook('wholeSurvey', async ({ question, answer, surveyResponse }) => {
        const answers = await surveyResponse.getAnswers();
        answerValues = answers.map(x => x.text);
      });

      const response = await app.post('surveyResponse', {
        body: {
          survey_id: testSurvey.id,
          entity_id: ENTITY_ID,
          timestamp: 123,
          answers: {
            [questionCode('whole-survey-a')]: 'Answer A',
            [questionCode('whole-survey-b')]: 'Answer B',
          },
        },
      });

      await database.waitForAllChangeHandlers();

      expect(answerValues.length).to.equal(2);
      expect(answerValues.some(x => x === 'Answer A')).to.be.true;
      expect(answerValues.some(x => x === 'Answer B')).to.be.true;
    });

    describe('Backdating', () => {
      it('Should run a hook for a new value', async () => {
        const spy = createHookSpy('backdateTestHook');

        await app.post('surveyResponse', {
          body: {
            survey_id: testSurvey.id,
            entity_id: ENTITY_ID,
            timestamp: 123,
            answers: {
              [questionCode('backdate-test')]: 'test',
            },
          },
        });

        await database.waitForAllChangeHandlers();

        expect(spy.called).to.be.true;

        const spy2 = createHookSpy('backdateTestHook');

        await app.post('surveyResponse', {
          body: {
            survey_id: testSurvey.id,
            entity_id: ENTITY_ID,
            timestamp: 223,
            answers: {
              [questionCode('backdate-test')]: 'test',
            },
          },
        });

        await database.waitForAllChangeHandlers();

        expect(spy2.called).to.be.true;
      });

      it('Should not run a hook for a backdated value', async () => {
        const spy = createHookSpy('backdateTestHook');

        await app.post('surveyResponse', {
          body: {
            survey_id: testSurvey.id,
            entity_id: ENTITY_ID,
            timestamp: 999,
            answers: {
              [questionCode('backdate-test')]: 'test',
            },
          },
        });

        await database.waitForAllChangeHandlers();

        expect(spy.called).to.be.true;

        const spy2 = createHookSpy('backdateTestHook');

        await app.post('surveyResponse', {
          body: {
            survey_id: testSurvey.id,
            entity_id: ENTITY_ID,
            timestamp: 888,
            answers: {
              [questionCode('backdate-test')]: 'test',
            },
          },
        });

        await database.waitForAllChangeHandlers();

        expect(spy2.called).to.be.false;
      });
    });
  });

  describe('Specific hooks', () => {
    it("Should update an entity's coordinates", async () => {
      const beforeEntity = await models.entity.findById(ENTITY_ID);
      expect(beforeEntity.point).to.be.null;
      expect(beforeEntity.bounds).to.be.null;

      // submit a survey response
      const response = await app.post('surveyResponse', {
        body: {
          survey_id: testSurvey.id,
          entity_id: ENTITY_ID,
          timestamp: 123,
          answers: {
            [questionCode('geo')]: JSON.stringify({
              latitude: 10,
              longitude: 10,
            }),
          },
        },
      });

      await database.waitForAllChangeHandlers();

      // expect the hook to have been called
      const entity = await models.entity.findById(ENTITY_ID);
      expect(entity.point).to.not.be.null;
      expect(entity.bounds).to.not.be.null;
    });

    it("Should update an entity's photo", async () => {
      const TEST_URL = 'https://facilities.com/update-an-entitys-photo/the-photo.jpg';

      const beforeEntity = await models.entity.findById(ENTITY_ID);
      expect(beforeEntity.image_url).to.not.equal(TEST_URL);

      // submit a survey response
      const response = await app.post('surveyResponse', {
        body: {
          survey_id: testSurvey.id,
          entity_id: ENTITY_ID,
          timestamp: 123,
          answers: {
            [questionCode('image')]: TEST_URL,
          },
        },
      });

      await database.waitForAllChangeHandlers();

      const entity = await models.entity.findById(ENTITY_ID);
      expect(entity.image_url).to.equal(TEST_URL);
    });

    describe('Entity creation', () => {
      before(async () => {
        // create some questions -- hooks already reg'd by the app
        await makeQuestion('create-code', 'Text', 'entityCreate');
        await makeQuestion('create-geo', 'Geolocate', 'entityCreate_location');
        await makeQuestion('create-name', 'Text', 'entityCreate_name');
        await makeQuestion('create-image-url', 'Text', 'entityCreate_image_url');
        await makeQuestion('create-type', 'Text', 'entityCreate_type');
      });

      it('Should create an entity', async () => {
        const TEST_URL = 'https://facilities.com/test-dynamic.jpg';
        const beforeEntity = await models.entity.findOne({ code: 'test_code' });
        expect(beforeEntity).to.be.null;

        // submit a survey response
        const response = await app.post('surveyResponse', {
          body: {
            survey_id: testSurvey.id,
            entity_id: ENTITY_ID,
            timestamp: 123,
            answers: {
              [questionCode('create-code')]: 'test_code',
              [questionCode('create-name')]: 'Test Dynamic Entity',
              [questionCode('create-image-url')]: TEST_URL,
              [questionCode('create-type')]: 'disaster',
            },
          },
        });

        await database.waitForAllChangeHandlers();

        const entity = await models.entity.findOne({ code: 'test_code' });
        expect(entity).to.not.be.null;
        expect(entity.parent_id).to.equal(ENTITY_ID);
        expect(entity.name).to.equal('Test Dynamic Entity');
        expect(entity.image_url).to.equal(TEST_URL);
        expect(entity.type).to.equal('disaster');
      });

      it('Should not create a duplicate entity', async () => {
        const DUP_CODE = 'test_dup_code';
        const TEST_URL = 'https://facilities.com/test-dupe.jpg';
        const beforeEntity = await models.entity.findOne({ code: DUP_CODE });
        expect(beforeEntity).to.be.null;

        // submit a survey response
        await app.post('surveyResponse', {
          body: {
            survey_id: testSurvey.id,
            entity_id: ENTITY_ID,
            timestamp: 123,
            answers: {
              [questionCode('create-code')]: DUP_CODE,
              [questionCode('create-name')]: 'Dupe Entity',
              [questionCode('create-image-url')]: TEST_URL,
              [questionCode('create-type')]: 'disaster',
            },
          },
        });

        await database.waitForAllChangeHandlers();

        const midEntity = await models.entity.findOne({ code: DUP_CODE });
        expect(midEntity).to.not.be.null;
        expect(midEntity.name).to.equal('Dupe Entity');
        expect(midEntity.type).to.equal('disaster');
        expect(midEntity.image_url).to.equal(TEST_URL);

        // submit a second survey response with slightly different data
        await app.post('surveyResponse', {
          body: {
            survey_id: testSurvey.id,
            entity_id: ENTITY_ID,
            timestamp: 123,
            answers: {
              [questionCode('create-code')]: DUP_CODE,
              [questionCode('create-name')]: 'Dupe Entity 2',
              [questionCode('create-type')]: 'facility',
            },
          },
        });

        await database.waitForAllChangeHandlers();

        const entity = await models.entity.findOne({ code: DUP_CODE });
        expect(entity).to.not.be.null;
        expect(entity.name).to.equal('Dupe Entity 2');
        expect(entity.type).to.equal('facility');
        expect(entity.image_url).to.equal(TEST_URL);
      });

      after(async () => {
        // delete all the entities we made
        await models.entity.delete({ parent_id: ENTITY_ID });

        // questions will get deleted in the `after` block below
      });
    });
  });

  after(async () => {
    // has to happen in this order to respect fk constraints
    await models.surveyScreenComponent.delete({ screen_id: testSurveyScreen.id });
    await models.surveyScreen.delete({ id: testSurveyScreen.id });
    await models.surveyResponse.delete({ survey_id: testSurvey.id });
    await Promise.all([
      models.facility.delete({ code: 'test-question-hook-clinic' }),
      models.entity.delete({ id: ENTITY_ID }),
      models.database.executeSql(`DELETE FROM "question" WHERE "code" LIKE 'TEST-%';`),
    ]);
    await models.survey.delete({ id: testSurvey.id });
  });
});
