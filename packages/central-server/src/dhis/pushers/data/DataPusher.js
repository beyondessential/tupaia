import { Pusher } from '../Pusher';

export class DataPusher extends Pusher {
  checkExistsOnDhis2 = syncLogRecord =>
    syncLogRecord &&
    (syncLogRecord.imported || syncLogRecord.updated) &&
    !syncLogRecord.deleted &&
    syncLogRecord.data;
}
