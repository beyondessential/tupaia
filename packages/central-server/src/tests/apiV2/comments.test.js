import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import { generateId } from '@tupaia/database';
import {
  resetTestData,
  TestableApp,
  upsertEntity,
  upsertDataGroup,
  upsertSurvey,
  upsertSurveyResponse,
  upsertComment,
  upsertSurveyResponseComment,
} from '../testUtilities';

const createSurveyResponse = async () => {
  const SURVEY_CODE = 'BASIC_SURVEY';
  const { id: dataGroupId } = await upsertDataGroup({
    code: SURVEY_CODE,
    service_type: 'tupaia',
    config: '{}',
  });
  const { id: surveyId } = await upsertSurvey({
    code: SURVEY_CODE,
    name: 'Basic Survey',
    data_group_id: dataGroupId,
  });

  const entity = await upsertEntity('TEST_ENTITY');
  const { id: surveyResponseId } = await upsertSurveyResponse({
    survey_id: surveyId,
    entity_id: entity.id,
    start_time: new Date().toISOString(),
    end_time: new Date().toISOString(),
  });
  return surveyResponseId;
};

const createComment = async ({ surveyResponseId, userId, text }) => {
  const comment = await upsertComment({ user_id: userId, text });
  await upsertSurveyResponseComment({
    survey_response_id: surveyResponseId,
    comment_id: comment.id,
  });
  return comment;
};

xdescribe('Survey Response Comments CRUD', () => {
  const app = new TestableApp();
  const { models } = app;

  beforeEach(app.authenticate);

  describe('Create: POST /surveyResponses/[id]/comments', () => {
    it("creates a survey response's comment", async () => {
      const surveyResponseId = await createSurveyResponse();
      const id = generateId();
      const text = 'It is the unknown that defines our existence.';

      const { statusCode, body } = await app.post(`surveyResponses/${surveyResponseId}/comments`, {
        body: { id, user_id: app.user.id, text },
      });

      expect(statusCode).to.equal(200);
      expect(body).to.deep.equal({ message: 'Successfully added comments' });

      const comment = await models.comment.findById(id);
      expect(comment).to.be.an('object');
      expect(comment.user_id).to.equal(app.user.id);
      expect(comment.text).to.equal(text);
      const surveyResponseCommentJoin = await models.surveyResponseComment.findOne({
        comment_id: id,
      });
      expect(surveyResponseCommentJoin.survey_response_id).to.equal(surveyResponseId);
    });
  });

  describe('Read: GET /surveyResponses/[id]/comments', () => {
    it('reads a list of survey response comments', async () => {
      const surveyResponseId = await createSurveyResponse();
      const commonData = { surveyResponseId, userId: app.user.id };

      const createdData = [
        await createComment({
          ...commonData,
          text: 'In a part of space where there are few rules, its more important than ever that we hold fast to our own.',
        }),
        await createComment({
          ...commonData,
          text: "We're stronger as a team.",
        }),
      ];

      const { body: comments } = await app.get(`surveyResponses/${surveyResponseId}/comments`);
      expect(comments.length).to.equal(2);

      for (const [index, comment] of createdData.entries()) {
        expect(comment).to.have.property('id');
        expect(comment).to.have.property('user_id');
        expect(comment).to.have.property('created_time');
        expect(comment).to.have.property('last_modified_time');
        expect(comment).to.have.property('text');

        expect(comment.id).to.equal(createdData[index].id);
        expect(comment.user_id).to.equal(app.user.id);
        expect(comment.text).to.equal(createdData[index].text);
      }
    });

    it('reads a single survey response comment', async () => {
      const surveyResponseId = await createSurveyResponse();
      const createdComment = await createComment({
        surveyResponseId,
        userId: app.user.id,
        text: "There is a way out of every box, a solution to every puzzle, it's just a matter of finding it.",
      });

      const { body: comment } = await app.get(
        `surveyResponses/${surveyResponseId}/comments/${createdComment.id}`,
      );

      expect(comment).to.have.property('id');
      expect(comment).to.have.property('user_id');
      expect(comment).to.have.property('created_time');
      expect(comment).to.have.property('last_modified_time');
      expect(comment).to.have.property('text');

      expect(comment.id).to.equal(createdComment.id);
      expect(comment.user_id).to.equal(createdComment.user_id);
      expect(comment.text).to.equal(createdComment.text);
    });
  });

  describe('Update: PUT /surveyResponses/[surveyResponseId]/comments/[commentId]', () => {
    it('updates a single survey response comment', async () => {
      const surveyResponseId = await createSurveyResponse();
      const createdComment = await createComment({
        surveyResponseId,
        userId: app.user.id,
        text: "Just because someone isn't born on Earth doesn't make him any less human.",
      });
      const newText = "Once you give up, the game's over.";

      const { statusCode, body } = await app.put(
        `surveyResponses/${surveyResponseId}/comments/${createdComment.id}`,
        {
          body: { text: newText },
        },
      );

      expect(statusCode).to.equal(200);
      expect(body).to.deep.equal({ message: 'Successfully updated comments' });

      const updatedComment = await models.comment.findById(createdComment.id);
      expect(updatedComment.text).to.equal(newText);
    });
  });

  describe('Delete: DELETE /surveyResponses/[surveyResponseId]/comments/[commentId]', () => {
    it('deletes a survey response comment', async () => {
      const surveyResponseId = await createSurveyResponse();
      const createdComment = await createComment({
        surveyResponseId,
        userId: app.user.id,
        text: "Just because someone isn't born on Earth doesn't make him any less human.",
      });

      const { statusCode, body } = await app.delete(
        `surveyResponses/${surveyResponseId}/comments/${createdComment.id}`,
      );

      expect(statusCode).to.equal(200);
      expect(body).to.deep.equal({ message: 'Successfully deleted comment' });

      const existingComments = await models.comment.all();
      expect(existingComments.length).to.equal(0);
    });
  });

  afterEach(resetTestData);
});
