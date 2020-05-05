/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { TestableApp } from '../TestableApp';
import { createAlert, generateTestId, resetTestData } from '../testUtilities';

describe('Alert Comments CRUD', () => {
  const app = new TestableApp();
  const models = app.models;

  beforeEach(app.authenticate);

  describe('Create: POST /alerts/[id]/comments', () => {
    it("creates an alert's comment", async () => {
      const { alert } = await createAlert('SISKO1');
      const id = generateTestId();
      const text = 'It is the unknown that defines our existence.';

      const { statusCode, body } = await app.post(`alerts/${alert.id}/comments`, {
        body: { id, user_account_id: app.user.id, text },
      });

      expect(statusCode).to.equal(200);
      expect(body).to.deep.equal({ message: 'Successfully added comments' });

      const comment = await models.comment.findById(id);
      expect(comment).to.be.an('object');
      expect(comment.user_account_id).to.equal(app.user.id);
      expect(comment.text).to.equal(text);
    });
  });

  /*

  truncate table alert_comment cascade; truncate table alert cascade; truncate table comment cascade;DELETE FROM user_account WHERE id LIKE '%_test%' OR email = 'test.user@tupaia.org' OR first_name = 'Automated test';


  describe.skip('Read: GET /alerts', () => {
    it('reads a list of alerts', async () => {
      const createdData = [await createAlert('ZORT1'), await createAlert('ZORT2')];

      const { body: alerts } = await app.get('alerts');
      expect(alerts.length).to.equal(3);

      for (const [index, { alert }] of createdData.entries()) {
        expect(alert).to.have.property('id');
        expect(alert).to.have.property('entity_id');
        expect(alert).to.have.property('data_element_id');
        expect(alert).to.have.property('start_time');
        expect(alert).to.have.property('end_time');
        expect(alert).to.have.property('event_confirmed_time');
        expect(alert).to.have.property('archived');

        expect(alert.id).to.equal(createdData[index].alert.id);
        expect(alert.entity_id).to.equal(createdData[index].entity.id);
        expect(alert.data_element_id).to.equal(createdData[index].dataElement.id);
        expect(alert.end_time).to.be.null;
        expect(alert.event_confirmed_time).to.be.null;
      }
    });

    it('reads a single alert', async () => {
      const { alert: createdAlert, entity, dataElement } = await createAlert('POIT1');

      const { body: alert } = await app.get(`alerts/${createdAlert.id}`);

      expect(alert).to.be.an('object');

      expect(alert).to.have.property('id');
      expect(alert).to.have.property('entity_id');
      expect(alert).to.have.property('data_element_id');
      expect(alert).to.have.property('start_time');
      expect(alert).to.have.property('end_time');
      expect(alert).to.have.property('event_confirmed_time');
      expect(alert).to.have.property('archived');

      expect(alert.id).to.equal(createdAlert.id);
      expect(alert.entity_id).to.equal(entity.id);
      expect(alert.data_element_id).to.equal(dataElement.id);
      expect(alert.end_time).to.be.null;
      expect(alert.event_confirmed_time).to.be.null;
    });
  });

  describe.skip('Update: PUT /alerts', () => {
    it('updates a single alert', async () => {
      const { alert } = await createAlert('EGAD1');
      const newEndTime = new Date();

      const { statusCode, body } = await app.put(`alerts/${alert.id}`, {
        body: { end_time: newEndTime, archived: true },
      });

      expect(statusCode).to.equal(200);
      expect(body).to.deep.equal({ message: 'Successfully updated alerts' });

      const updatedAlert = await models.alert.findById(alert.id);
      expect(updatedAlert.end_time.getTime()).to.equal(newEndTime.getTime());
      expect(updatedAlert.archived).to.be.true;
    });
  });

  describe.skip('Delete: DELETE /alerts', () => {
    it('deletes an alert', async () => {
      const { alert } = await createAlert('TROZ1');

      const { statusCode, body } = await app.delete(`alerts/${alert.id}`);

      expect(statusCode).to.equal(200);
      expect(body).to.deep.equal({ message: 'Successfully deleted alert' });

      const deletedAlert = await models.alert.find({ id: alert.id });
      expect(deletedAlert.length).to.equal(0);
    });
  });

  */

  afterEach(resetTestData);
});
