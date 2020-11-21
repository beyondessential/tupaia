/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { generateTestId } from '@tupaia/database';
import { TestableApp } from '../TestableApp';
import { createAlert, createComment, resetTestData } from '../testUtilities';

describe('Alert Comments CRUD', () => {
  const app = new TestableApp();
  const { models } = app;

  beforeEach(app.authenticate);

  describe('Create: POST /alerts/[id]/comments', () => {
    it("creates an alert's comment", async () => {
      const { alert } = await createAlert('SISKO1');
      const id = generateTestId();
      const text = 'It is the unknown that defines our existence.';

      const { statusCode, body } = await app.post(`alerts/${alert.id}/comments`, {
        body: { id, user_id: app.user.id, text },
      });

      expect(statusCode).to.equal(200);
      expect(body).to.deep.equal({ message: 'Successfully added comments' });

      const comment = await models.comment.findById(id);
      expect(comment).to.be.an('object');
      expect(comment.user_id).to.equal(app.user.id);
      expect(comment.text).to.equal(text);
      const alertCommentJoin = await models.alertComment.findOne({ comment_id: id });
      expect(alertCommentJoin.alert_id).to.equal(alert.id);
    });
  });

  describe('Read: GET /alerts/[id]/comments', () => {
    it('reads a list of alert comments', async () => {
      const {
        alert: { id: alertId },
      } = await createAlert('JANEWAY1');
      const commonData = { alert_id: alertId, user_id: app.user.id };

      const createdData = [
        await createComment({
          ...commonData,
          text:
            'In a part of space where there are few rules, its more important than ever that we hold fast to our own.',
        }),
        await createComment({
          ...commonData,
          text: "We're stronger as a team.",
        }),
      ];

      const { body: comments } = await app.get(`alerts/${alertId}/comments`);
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

    it('reads a single alert comment', async () => {
      const {
        alert: { id: alertId },
      } = await createAlert('PICARD1');
      const createdComment = await createComment({
        alert_id: alertId,
        user_id: app.user.id,
        text:
          "There is a way out of every box, a solution to every puzzle, it's just a matter of finding it.",
      });

      const { body: comment } = await app.get(`alerts/${alertId}/comments/${createdComment.id}`);

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

  describe('Update: PUT /alerts/[alertId]/comments/[commentId]', () => {
    it('updates a single alert comment', async () => {
      const {
        alert: { id: alertId },
      } = await createAlert('ARCHER1');
      const createdComment = await createComment({
        alert_id: alertId,
        user_id: app.user.id,
        text: "Just because someone isn't born on Earth doesn't make him any less human.",
      });
      const newText = "Once you give up, the game's over.";

      const { statusCode, body } = await app.put(
        `alerts/${alertId}/comments/${createdComment.id}`,
        { body: { text: newText } },
      );

      expect(statusCode).to.equal(200);
      expect(body).to.deep.equal({ message: 'Successfully updated comments' });

      const updatedComment = await models.comment.findById(createdComment.id);
      expect(updatedComment.text).to.equal(newText);
    });
  });

  describe('Delete: DELETE /alerts/[alertId]/comments/[commentId]', () => {
    it('deletes an alert comment', async () => {
      const {
        alert: { id: alertId },
      } = await createAlert('PIKE1');
      const createdComment = await createComment({
        alert_id: alertId,
        user_id: app.user.id,
        text: "Just because someone isn't born on Earth doesn't make him any less human.",
      });

      const { statusCode, body } = await app.delete(
        `alerts/${alertId}/comments/${createdComment.id}`,
      );

      expect(statusCode).to.equal(200);
      expect(body).to.deep.equal({ message: 'Successfully deleted comment' });

      const existingComments = await models.comment.all();
      expect(existingComments.length).to.equal(0);
    });
  });

  afterEach(resetTestData);
});
