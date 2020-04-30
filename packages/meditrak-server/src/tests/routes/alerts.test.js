/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { TestableApp } from '../TestableApp';
import { createAlert, resetTestData } from '../testUtilities';

describe('Alerts CRUD', () => {
  const app = new TestableApp();
  const models = app.models;
  const testAlertData = [];

  /*
  const localReset = async () => {
    for (const item of testAlertData) {
      await models.alert.delete({ id: item.alert.id });
    }

    for (const code of ['TROZ', 'NARF', 'ZORT', 'EGAD', 'FIORD', 'POIT']) {
      await models.entity.delete({ code });
      await models.dataSource.delete({ code });
    }
  };
  */

  before(async () => {
    await app.authenticate();
  });

  describe('Create: POST /alerts', () => {
    it('creates an alert', async () => {
      const troz = await createAlert('TROZ');
      const { alert, entity, dataElement } = troz;

      const { statusCode, body } = await app.post('alert', {
        body: {
          entity_id: entity.id,
          data_element_id: dataElement.id,
          start_time: new Date().toISOString(),
        },
      });

      expect(statusCode).to.equal(200);
      expect(body).to.deep.equal({ message: 'Successfully added alert' });

      await models.alert.delete({ id: alert.id });
      await models.alert.delete({ entity_id: entity.id, data_element_id: dataElement.id });
    });
  });

  describe('Read: GET /alerts', () => {
    it('reads a list of alerts', async () => {
      testAlertData.push(await createAlert('NARF'));
      testAlertData.push(await createAlert('ZORT'));

      const { body: alerts } = await app.get('alerts');
      expect(alerts.length).to.equal(2);

      for (const [index, alert] of alerts.entries()) {
        expect(alert).to.have.property('id');
        expect(alert).to.have.property('entity_id');
        expect(alert).to.have.property('data_element_id');
        expect(alert).to.have.property('start_time');
        expect(alert).to.have.property('end_time');
        expect(alert).to.have.property('event_confirmed_time');
        expect(alert).to.have.property('archived');

        expect(alert.id).to.equal(testAlertData[index].alert.id);
        expect(alert.entity_id).to.equal(testAlertData[index].entity.id);
        expect(alert.data_element_id).to.equal(testAlertData[index].dataElement.id);
        expect(alert.end_time).to.be.null;
        expect(alert.event_confirmed_time).to.be.null;
      }
    });

    it('reads a single alert', async () => {
      testAlertData.push(await createAlert('EGAD'));

      const { body: alert } = await app.get(`alerts/${testAlertData[2].alert.id}`);

      expect(alert).to.be.an('object');

      expect(alert).to.have.property('id');
      expect(alert).to.have.property('entity_id');
      expect(alert).to.have.property('data_element_id');
      expect(alert).to.have.property('start_time');
      expect(alert).to.have.property('end_time');
      expect(alert).to.have.property('event_confirmed_time');
      expect(alert).to.have.property('archived');

      expect(alert.id).to.equal(testAlertData[2].alert.id);
      expect(alert.entity_id).to.equal(testAlertData[2].entity.id);
      expect(alert.data_element_id).to.equal(testAlertData[2].dataElement.id);
      expect(alert.end_time).to.be.null;
      expect(alert.event_confirmed_time).to.be.null;
    });
  });

  describe('Update: PUT /alerts', () => {
    it('updates a single alert', async () => {
      const testAlertData1 = await createAlert('FIORD');
      const { alert } = testAlertData1;
      const newEndTime = new Date().toISOString();
      testAlertData.push(testAlertData1);

      const { statusCode, body } = await app.put(`alerts/${alert.id}`, {
        body: { end_time: newEndTime, archived: true },
      });

      expect(statusCode).to.equal(200);
      expect(body).to.deep.equal({ message: 'Successfully updated alerts' });

      const createdAlert = await models.alert.findById(alert.id);
      expect(createdAlert.end_time).is.not.null;
      expect(createdAlert.archived).to.be.true;
    });
  });

  describe('Delete: DELETE /alerts', () => {
    it('deletes an alert', async () => {
      const testAlertData1 = await createAlert('POIT');
      const { alert } = testAlertData1;
      testAlertData.push(testAlertData1);

      const { statusCode, body } = await app.delete(`alerts/${alert.id}`);

      expect(statusCode).to.equal(200);
      expect(body).to.deep.equal({ message: 'Successfully deleted alert' });

      const deletedAlert = await models.alert.find({ id: alert.id });
      expect(deletedAlert.length).to.equal(0);
    });
  });

  after(resetTestData);
});
