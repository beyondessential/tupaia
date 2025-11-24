import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import {
  buildAndInsertSurvey,
  buildAndInsertSurveyResponses,
  findOrCreateDummyCountryEntity,
  findOrCreateDummyRecord,
} from '@tupaia/database';
import { getModels } from '../testUtilities';
import { DhisChangeValidator } from '../../dhis/DhisChangeValidator';

const models = getModels();
describe('DhisChangeValidator', async () => {
  const ChangeValidator = new DhisChangeValidator(models);

  let answers;
  let surveyResponse;

  before(async () => {
    const user = await findOrCreateDummyRecord(models.user, { email: 'test_user@email.com' });
    const { entity: tongaEntity } = await findOrCreateDummyCountryEntity(models, { code: 'TO' });
    const adminPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Admin',
    });
    const SURVEY = {
      code: 'testSurvey',
      name: 'Test Survey',
      dataGroup: {
        code: 'testDataGroup',
        service_type: 'dhis',
        config: {
          dhisInstanceCode: 'test_instance',
        },
      },
      questions: [
        {
          code: 'question1',
          type: 'FreeText',
          prompt: 'Question 1',
        },
      ],
    };

    await buildAndInsertSurvey(models, SURVEY);
    const SURVEY_RESPONSE = {
      surveyCode: 'testSurvey',
      entityCode: tongaEntity.code,
      answers: {
        question1: 'answer1',
      },
    };

    await models.userEntityPermission.create({
      user_id: user.id,
      entity_id: tongaEntity.id,
      permission_group_id: adminPermissionGroup.id,
    });

    const [builtSurveyResponse] = await buildAndInsertSurveyResponses(
      models,
      [SURVEY_RESPONSE],
      user,
    );
    answers = await Promise.all(builtSurveyResponse.answers.map(answer => answer.getData()));
    surveyResponse = await builtSurveyResponse.surveyResponse.getData();
  });

  describe('getOutdatedAnswersAndSurveyResponses', () => {
    it('should return outdated survey responses and associated answers as deletes', async () => {
      await models.surveyResponse.updateById(surveyResponse.id, { outdated: true });
      const changes = [
        {
          record_id: surveyResponse.id,
          record_type: 'survey_response',
          type: 'update',
          new_record: {
            ...surveyResponse,
            outdated: true,
          },
          old_record: surveyResponse,
        },
      ];
      const result = await ChangeValidator.getOutdatedAnswersAndSurveyResponses(changes);
      expect(result.length).to.equal(2);
      expect(result).to.deep.equal([
        {
          record_id: surveyResponse.id,
          record_type: 'survey_response',
          type: 'delete',
          new_record: null,
          old_record: surveyResponse,
        },
        ...answers.map(answer => ({
          record_id: answer.id,
          record_type: 'answer',
          type: 'delete',
          new_record: null,
          old_record: answer,
        })),
      ]);
    });

    it('should not include any answers already being deleted in the changes list', async () => {
      await models.surveyResponse.updateById(surveyResponse.id, { outdated: true });
      const changes = [
        {
          record_id: surveyResponse.id,
          record_type: 'survey_response',
          type: 'update',
          new_record: {
            ...surveyResponse,
            outdated: true,
          },
          old_record: surveyResponse,
        },
        {
          record_id: answers[0].id,
          record_type: 'answer',
          type: 'delete',
          old_record: answers[0],
        },
      ];
      const result = await ChangeValidator.getOutdatedAnswersAndSurveyResponses(changes);
      expect(result.length).to.equal(1);
      expect(result).to.deep.equal([
        {
          record_id: surveyResponse.id,
          record_type: 'survey_response',
          type: 'delete',
          new_record: null,
          old_record: surveyResponse,
        },
      ]);
    });

    it('should not include any already outdated survey responses being updated', async () => {
      await models.surveyResponse.updateById(surveyResponse.id, { outdated: true });
      const changes = [
        {
          record_id: surveyResponse.id,
          record_type: 'survey_response',
          type: 'update',
          new_record: {
            ...surveyResponse,
            outdated: true,
            data_time: new Date('2024-07-24').toISOString(),
          },
          old_record: {
            ...surveyResponse,
            outdated: true,
          },
        },
      ];
      const result = await ChangeValidator.getOutdatedAnswersAndSurveyResponses(changes);

      expect(result.length).to.equal(0);
    });
  });

  describe('getAnswersToUpdate', () => {
    it('should return answers associated with any survey responses that are changing from outdated to not outdated', async () => {
      const changes = [
        {
          record_id: surveyResponse.id,
          record_type: 'survey_response',
          type: 'update',
          new_record: surveyResponse,
          old_record: {
            ...surveyResponse,
            outdated: true,
          },
        },
      ];
      const result = await ChangeValidator.getAnswersToUpdate(changes);
      expect(result.length).to.equal(1);
      expect(result).to.deep.equal(
        answers.map(answer => ({
          record_id: answer.id,
          record_type: 'answer',
          type: 'update',
          new_record: answer,
          old_record: answer,
        })),
      );
    });

    it('should not include any answers already being updated in the changes list', async () => {
      const changes = [
        {
          record_id: surveyResponse.id,
          record_type: 'survey_response',
          type: 'update',
          new_record: surveyResponse,
          old_record: {
            ...surveyResponse,
            outdated: true,
          },
        },
        {
          record_id: answers[0].id,
          record_type: 'answer',
          type: 'update',
          old_record: answers[0],
        },
      ];
      const result = await ChangeValidator.getAnswersToUpdate(changes);
      expect(result.length).to.equal(0);
    });
  });
});
