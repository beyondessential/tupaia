/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { buildAndInsertSurveys, populateTestData } from '@tupaia/database';
import { EventPusher } from '../../../../../dhis/pushers/data/event/EventPusher';
import { getModels, resetTestData } from '../../../../testUtilities';
import { Pusher } from '../../../../../dhis/pushers/Pusher';
import { createDataBrokerStub } from './createDataBrokerStub';
import {
  BASELINE_TEST_DATA,
  QUESTION,
  SURVEY,
  CHANGE,
  DHIS_REFERENCE,
  SERVER_NAME,
} from './EventPusher.fixtures';

jest.mock('../../../../../dhis/pushers/data/event/EventBuilder');

// relatively simple tests in here as EventBuilder contains a lot of logic, and is tested separately
describe('EventPusher', () => {
  const models = getModels();
  const dhisApi = {};
  const dataBroker = createDataBrokerStub();

  describe('push()', () => {
    beforeAll(async () => {
      jest.spyOn(Pusher.prototype, 'logResults').mockClear().mockImplementation();
    });

    beforeEach(async () => {
      // populate default test data
      await buildAndInsertSurveys(models, [{ ...SURVEY, questions: [QUESTION] }]);
      await populateTestData(models, BASELINE_TEST_DATA);
    });

    afterEach(async () => {
      // clear test data
      await resetTestData();
    });

    describe('creating a new survey response', () => {
      it('should log an error and return false if the changed record was not found', async () => {
        const change = await models.dhisSyncQueue.findById(CHANGE.id);
        change.record_id = 'does_not_exist_xxxxxxxxx';
        const pusher = new EventPusher(models, change, dhisApi, dataBroker);
        const result = await pusher.push();
        expect(result).toBe(false);
        expect(pusher.logResults).toHaveBeenCalledWith(
          expect.objectContaining({
            errors: [expect.objectContaining(/No survey response found/i)],
          }),
        );
        expect(dataBroker.push).not.toHaveBeenCalled();
        expect(dataBroker.delete).not.toHaveBeenCalled();
      });

      it('should post all the data values to a program', async () => {
        const change = await models.dhisSyncQueue.findById(CHANGE.id);
        const pusher = new EventPusher(models, change, dhisApi, dataBroker);

        const result = await pusher.push();
        expect(result).toBe(true);
        expect(dataBroker.push).toHaveBeenCalledTimes(1);
        expect(dataBroker.delete).not.toHaveBeenCalled();
      });
    });

    describe('updating an existing survey response', () => {
      it('should delete and repost all the data values to a program', async () => {
        const change = await models.dhisSyncQueue.findById(CHANGE.id);
        const syncLogRecord = {
          id: change.record_id,
          record_id: change.record_id,
          imported: 1,
          updated: 0,
          deleted: 0,
          ignored: 0,
          dhis_reference: DHIS_REFERENCE,
          data: `{"program":"${SURVEY.code}", "serverName":"${SERVER_NAME}"}`,
        };
        await populateTestData(models, { dhisSyncLog: [syncLogRecord] });

        const pusher = new EventPusher(models, change, dhisApi, dataBroker);

        const result = await pusher.push();
        expect(result).toBe(true);
        expect(dataBroker.delete).toHaveBeenCalledOnceWith(
          {
            type: pusher.dataSourceTypes.DATA_GROUP,
            code: SURVEY.code,
          },
          { dhisReference: DHIS_REFERENCE },
          { serverName: SERVER_NAME },
        );
        expect(dataBroker.push).toHaveBeenCalledTimes(1);
      });
    });

    describe('deleting a survey response', () => {
      it('should delete the event entirely', async () => {
        const change = await models.dhisSyncQueue.findById(CHANGE.id);
        change.type = 'delete';
        const syncLogRecord = {
          id: change.record_id,
          record_id: change.record_id,
          imported: 1,
          updated: 0,
          deleted: 0,
          ignored: 0,
          dhis_reference: DHIS_REFERENCE,
          data: `{"program":"${SURVEY.code}", "serverName":"${SERVER_NAME}"}`,
        };
        await populateTestData(models, { dhisSyncLog: [syncLogRecord] });

        const pusher = new EventPusher(models, change, dhisApi, dataBroker);

        const result = await pusher.push();
        expect(result).toBe(true);
        expect(dataBroker.delete).toHaveBeenCalledOnceWith(
          {
            type: pusher.dataSourceTypes.DATA_GROUP,
            code: SURVEY.code,
          },
          { dhisReference: DHIS_REFERENCE },
          { serverName: SERVER_NAME },
        );
        expect(dataBroker.push).not.toHaveBeenCalled();
      });
    });
  });
});
