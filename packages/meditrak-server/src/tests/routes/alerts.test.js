/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { generateTestId } from '@tupaia/database';
import { TestableApp } from '../TestableApp';
import { createEntity, createDataElement, createAlert, resetTestData } from '../testUtilities';

describe('Alerts CRUD', () => {
  const app = new TestableApp();
  const { models } = app;

  beforeEach(app.authenticate);

  describe('Create: POST /alerts', () => {
    it('creates an alert', async () => {
      const entity = await createEntity('NARF1');
      const dataElement = await createDataElement('NARF2');
      const startTime = new Date();

      const { statusCode, body } = await app.post('alerts', {
        body: {
          id: generateTestId(),
          entity_id: entity.id,
          data_element_id: dataElement.id,
          start_time: startTime,
        },
      });

      expect(statusCode).to.equal(200);
      expect(body).to.deep.equal({ message: 'Successfully added alerts' });

      const latestAlert = (await models.alert.all()).pop();
      expect(latestAlert.entity_id).to.equal(entity.id);
      expect(latestAlert.data_element_id).to.equal(dataElement.id);
      expect(latestAlert.start_time.getTime()).to.equal(startTime.getTime());
    });
  });

  describe('Read: GET /alerts', () => {
    it('reads a list of alerts', async () => {
      const createdData = [await createAlert('ZORT1'), await createAlert('ZORT2')];

      const { body: alerts } = await app.get('alerts');
      expect(alerts.length).to.equal(2);

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

  describe('Update: PUT /alerts', () => {
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

  describe('Delete: DELETE /alerts', () => {
    it('deletes an alert', async () => {
      const { alert } = await createAlert('TROZ1');

      const { statusCode, body } = await app.delete(`alerts/${alert.id}`);

      expect(statusCode).to.equal(200);
      expect(body).to.deep.equal({ message: 'Successfully deleted alert' });

      const deletedAlert = await models.alert.find({ id: alert.id });
      expect(deletedAlert.length).to.equal(0);
    });
  });

  afterEach(resetTestData);
});
