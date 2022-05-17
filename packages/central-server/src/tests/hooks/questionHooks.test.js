import { expect } from 'chai';

import { buildAndInsertSurveys, generateTestId, upsertDummyRecord } from '@tupaia/database';
import { TestableApp } from '../testUtilities';
import { registerHook } from '../../hooks';

const ENTITY_ID = generateTestId();

const GENERIC_SURVEY_ID = generateTestId();
const ENTITY_CREATION_SURVEY_ID = generateTestId();
const SURVEYS = [
  {
    id: GENERIC_SURVEY_ID,
    code: 'test-generic-hook',
    questions: [
      { code: 'TEST_test', type: 'Text', hook: 'testHook' },
      { code: 'TEST_geo', type: 'Geolocate', hook: 'entityCoordinates' },
      { code: 'TEST_image', type: 'Text', hook: 'entityImage' },
      { code: 'TEST_backdate-test', type: 'Text', hook: 'backdateTestHook' },
      { code: 'TEST_whole-survey-a', type: 'Text', hook: 'wholeSurvey' },
      { code: 'TEST_whole-survey-b', type: 'Text' },
    ],
  },
  {
    id: ENTITY_CREATION_SURVEY_ID,
    code: 'test-entity-creation-hook',
    questions: [
      // Hooks already registered by the app
      { code: 'TEST_create-code', type: 'Text', hook: 'entityCreate' },
      { code: 'TEST_create-geo', type: 'Geolocate', hook: 'entityCreate_location' },
      { code: 'TEST_create-name', type: 'Text', hook: 'entityCreate_name' },
      { code: 'TEST_create-image-url', type: 'Text', hook: 'entityCreate_image_url' },
      { code: 'TEST_create-type', type: 'Text', hook: 'entityCreate_type' },
    ],
  },
];

describe('Question hooks', () => {
  const app = new TestableApp();
  const { models } = app;
  const { database } = models;

  const createHookSpy = name => {
    // register the hook
    const spy = { called: false, params: null };
    registerHook(name, params => {
      spy.called = true;
      spy.params = params;
    });
    return spy;
  };

  before(async () => {
    await app.authenticate();
    await app.grantFullAccess();

    const country = await upsertDummyRecord(models.country);
    const geographicalArea = await upsertDummyRecord(models.geographicalArea, {
      country_id: country.id,
    });
    await models.facility.create({
      id: generateTestId(),
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

    await buildAndInsertSurveys(models, SURVEYS);
  });

  describe('Basic functionality', () => {
    it('Should call the hook for a machine submission', async () => {
      const spy = createHookSpy('testHook');

      // submit a survey response
      await app.post('surveyResponse', {
        body: {
          survey_id: GENERIC_SURVEY_ID,
          entity_id: ENTITY_ID,
          timestamp: 123,
          answers: {
            TEST_test: 'CHECK',
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
      registerHook('wholeSurvey', async ({ surveyResponse }) => {
        const answers = await surveyResponse.getAnswers();
        answerValues = answers.map(x => x.text);
      });

      await app.post('surveyResponse', {
        body: {
          survey_id: GENERIC_SURVEY_ID,
          entity_id: ENTITY_ID,
          timestamp: 123,
          answers: {
            'TEST_whole-survey-a': 'Answer A',
            'TEST_whole-survey-b': 'Answer B',
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
            survey_id: GENERIC_SURVEY_ID,
            entity_id: ENTITY_ID,
            timestamp: 123,
            answers: {
              'TEST_backdate-test': 'test',
            },
          },
        });

        await database.waitForAllChangeHandlers();

        expect(spy.called).to.be.true;

        const spy2 = createHookSpy('backdateTestHook');

        await app.post('surveyResponse', {
          body: {
            survey_id: GENERIC_SURVEY_ID,
            entity_id: ENTITY_ID,
            timestamp: 223,
            answers: {
              'TEST_backdate-test': 'test',
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
            survey_id: GENERIC_SURVEY_ID,
            entity_id: ENTITY_ID,
            timestamp: 999,
            answers: {
              'TEST_backdate-test': 'test',
            },
          },
        });

        await database.waitForAllChangeHandlers();

        expect(spy.called).to.be.true;

        const spy2 = createHookSpy('backdateTestHook');

        await app.post('surveyResponse', {
          body: {
            survey_id: GENERIC_SURVEY_ID,
            entity_id: ENTITY_ID,
            timestamp: 888,
            answers: {
              'TEST_backdate-test': 'test',
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
      await app.post('surveyResponse', {
        body: {
          survey_id: GENERIC_SURVEY_ID,
          entity_id: ENTITY_ID,
          timestamp: 123,
          answers: {
            TEST_geo: JSON.stringify({
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
      await app.post('surveyResponse', {
        body: {
          survey_id: GENERIC_SURVEY_ID,
          entity_id: ENTITY_ID,
          timestamp: 123,
          answers: {
            TEST_image: TEST_URL,
          },
        },
      });

      await database.waitForAllChangeHandlers();

      const entity = await models.entity.findById(ENTITY_ID);
      expect(entity.image_url).to.equal(TEST_URL);

      // should be otherwise unchanged
      const { image_url: beforeImageUrl, ...beforeData } = await beforeEntity.getData();
      const { image_url: afterImageUrl, ...afterData } = await entity.getData();
      expect(beforeData).to.deep.equal(afterData);
    });

    describe('Entity creation', () => {
      it('Should create an entity', async () => {
        const TEST_URL = 'https://facilities.com/test-dynamic.jpg';
        const beforeEntity = await models.entity.findOne({ code: 'test_code' });
        expect(beforeEntity).to.be.null;

        // submit a survey response
        await app.post('surveyResponse', {
          body: {
            survey_id: ENTITY_CREATION_SURVEY_ID,
            entity_id: ENTITY_ID,
            timestamp: 123,
            answers: {
              'TEST_create-code': 'test_code',
              'TEST_create-name': 'Test Dynamic Entity',
              'TEST_create-image-url': TEST_URL,
              'TEST_create-type': 'disaster',
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
            survey_id: ENTITY_CREATION_SURVEY_ID,
            entity_id: ENTITY_ID,
            timestamp: 123,
            answers: {
              'TEST_create-code': DUP_CODE,
              'TEST_create-name': 'Dupe Entity',
              'TEST_create-image-url': TEST_URL,
              'TEST_create-type': 'disaster',
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
            survey_id: ENTITY_CREATION_SURVEY_ID,
            entity_id: ENTITY_ID,
            timestamp: 123,
            answers: {
              'TEST_create-code': DUP_CODE,
              'TEST_create-name': 'Dupe Entity 2',
              'TEST_create-type': 'facility',
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
    });
  });
});
