const SYNC_QUEUE_KEY = 'dhisSyncQueue';
const CHANGE_BATCH_SIZE = 1000;

const resolveAfterXChanges = (changeChannel, resolve, x) => {
  if (x === 0) {
    resolve();
    return;
  }
  let changeCount = 0;
  changeChannel.addDataChangeHandler(() => {
    changeCount++;
    if (changeCount === x) resolve();
  });
};

export const markRecordsForResync = async (changeChannel, recordType, records) => {
  for (let batchStartIndex = 0; batchStartIndex < records.length; batchStartIndex += 1000) {
    await new Promise(resolve => {
      const batchOfRecords = records.slice(batchStartIndex, batchStartIndex + CHANGE_BATCH_SIZE);
      resolveAfterXChanges(changeChannel, resolve, batchOfRecords.length);
      changeChannel.publishRecordUpdates(recordType, batchOfRecords, SYNC_QUEUE_KEY);
    });
  }
};
