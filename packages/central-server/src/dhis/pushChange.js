import winston from 'winston';

import { getPusherForEntity, EventPusher, AggregateDataPusher } from './pushers';

export async function pushChange(models, change, dhisApi, dataBroker) {
  try {
    const Pusher = await getPusher(models, change);
    const pusher = new Pusher(models, change, dhisApi, dataBroker);
    const wasSuccessful = await pusher.push();
    return wasSuccessful;
  } catch (error) {
    winston.error(error);
    return false; // Record this as a failed attempt
  }
}

async function checkIsEventBased(models, change) {
  const { type: changeType, record_id: recordId } = change;
  if (changeType === 'delete') {
    // If deleted, we can't access the original record, but we can look in the dhis sync log
    // to see if it was sent using the event api (if it contains "program" in the pushed data)
    // If it was event based but never successfully pushed we can't use the log to work it out,
    // but it also doesn't matter as both push handlers will just discard "delete" changes for
    // records without a sync log record
    const existingSyncLogRecord = await models.dhisSyncLog.findOne({ record_id: recordId });
    return (
      existingSyncLogRecord &&
      existingSyncLogRecord.data &&
      existingSyncLogRecord.data.includes('"program":')
    );
  }

  return models.surveyResponse.checkIsEventBased(change.record_id);
}

const getPusher = async (models, change) => {
  const ANSWER = models.answer.databaseRecord;
  const ENTITY = models.entity.databaseRecord;
  const SURVEY_RESPONSE = models.surveyResponse.databaseRecord;
  const { record_type: recordType } = change;

  switch (recordType) {
    case ENTITY:
      return getPusherForEntity(models, change);
    case SURVEY_RESPONSE: {
      const isEventBased = await checkIsEventBased(models, change);
      return isEventBased ? EventPusher : AggregateDataPusher;
    }
    case ANSWER:
      return AggregateDataPusher;
    default:
      throw new Error(`Invalid change record type: ${recordType}`);
  }
};
