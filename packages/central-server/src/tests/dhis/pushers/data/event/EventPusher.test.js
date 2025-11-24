import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import sinon from 'sinon';

import { buildAndInsertSurveys, populateTestData } from '@tupaia/database';
import { EventPusher } from '../../../../../dhis/pushers/data/event/EventPusher';
import { EventBuilder } from '../../../../../dhis/pushers/data/event/EventBuilder';
import { getModels, resetTestData } from '../../../../testUtilities';
import { Pusher } from '../../../../../dhis/pushers/Pusher';
import { createDataBrokerStub, resetDataBrokerStubHistory } from './createDataBrokerStub';
import {
  BASELINE_TEST_DATA,
  QUESTION,
  SURVEY,
  CHANGE,
  DHIS_REFERENCE,
  SERVER_NAME,
} from './EventPusher.fixtures';

// relatively simple tests in here as EventBuilder contains a lot of logic, and is tested separately
describe('EventPusher', () => {
  const models = getModels();
  const dhisApi = {};
  const dataBroker = createDataBrokerStub();

  describe('push()', () => {
    before(async () => {
      sinon.stub(Pusher.prototype, 'logResults');
      sinon.stub(EventBuilder.prototype, 'build');
    });

    after(() => {
      Pusher.prototype.logResults.restore();
      EventBuilder.prototype.build.restore();
    });

    beforeEach(async () => {
      // populate default test data
      await buildAndInsertSurveys(models, [{ ...SURVEY, questions: [QUESTION] }]);
      await populateTestData(models, BASELINE_TEST_DATA);
    });

    afterEach(async () => {
      // reset spy calls after each test case
      resetDataBrokerStubHistory(dataBroker);

      // clear test data
      await resetTestData();
    });

    describe('creating a new survey response', () => {
      it('should log an error and return false if the changed record was not found', async () => {
        const change = await models.dhisSyncQueue.findById(CHANGE.id);
        change.record_id = 'does_not_exist_xxxxxxxxx';
        const pusher = new EventPusher(models, change, dhisApi, dataBroker);
        await expect(pusher.push()).to.eventually.be.false;
        expect(pusher.logResults).to.have.been.calledWithMatch(
          sinon.match({ errors: [sinon.match(/No survey response found/i)] }),
        );
        expect(dataBroker.push).not.to.have.been.called;
        expect(dataBroker.delete).not.to.have.been.called;
      });

      it('should post all the data values to a program', async () => {
        const change = await models.dhisSyncQueue.findById(CHANGE.id);
        const pusher = new EventPusher(models, change, dhisApi, dataBroker);

        const result = await pusher.push();
        expect(result).to.be.true;
        expect(dataBroker.push).to.have.been.calledOnce;
        expect(dataBroker.delete).not.to.have.been.called;
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
        expect(result).to.be.true;
        expect(dataBroker.delete).to.have.been.calledOnceWith(
          {
            type: pusher.dataSourceTypes.DATA_GROUP,
            code: SURVEY.code,
          },
          { dhisReference: DHIS_REFERENCE },
          { serverName: SERVER_NAME },
        );
        expect(dataBroker.push).to.have.been.calledOnce;
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
        expect(result).to.be.true;
        expect(dataBroker.delete).to.have.been.calledOnceWith(
          {
            type: pusher.dataSourceTypes.DATA_GROUP,
            code: SURVEY.code,
          },
          { dhisReference: DHIS_REFERENCE },
          { serverName: SERVER_NAME },
        );
        expect(dataBroker.push).not.to.have.been.called;
      });
    });
  });
});
