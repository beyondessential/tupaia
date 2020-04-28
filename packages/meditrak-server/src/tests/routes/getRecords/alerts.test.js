/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TestableApp } from '../../TestableApp';
import { createAlert } from '../../testUtilities';

describe('Alerts CRUD', () => {
  const app = new TestableApp();
  const models = app.models;
  let testEntity = null;
  let testDataElement = null;
  let testAlert = null;
  const testStartTime = '2012-11-10T09:08:07.654Z';

  before(async () => {
    await app.authenticate();
  });

  describe('GET /alerts', () => {
    before(async () => {
      const testData = await createAlert();
      testEntity = testData.testEntity;
      testDataElement = testData.testDataElement;
      testAlert = testData.testAlert;

      console.log('testEntity', testEntity.id);
      console.log('testDataElement', testDataElement.id);
      console.log('testAlert', testAlert.id);

      /*
      testEntity = await models.entity.create({
        code: 'ABC',
        name: 'ABC',
      });

      testDataElement = await models.dataSource.create({
        code: 'DEF',
        type: 'dataElement',
        service_type: 'dhis',
        config: {},
      });

      testAlert = await models.alert.create({
        entity_id: testEntity.id,
        data_element_id: testDataElement.id,
        start_time: testStartTime,
      });
      */
    });

    it('test', async () => {
      console.log('IT TEST');
    });
  });

  after(async () => {
    await models.alert.delete({ id: testAlert.id });
    await models.entity.delete({ id: testEntity.id });
    await models.dataSource.delete({ id: testDataElement.id });
  });
});
