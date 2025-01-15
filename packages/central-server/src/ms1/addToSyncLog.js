// limit the number of error messages to avoid busting payload
const ERROR_MESSAGE_CAP = 5;

export async function addToSyncLog(models, change, error = '', endpoint, data) {
  const currentLogEntry = await models.ms1SyncLog.findOne({
    record_id: change.record_id,
  });
  const count = currentLogEntry ? currentLogEntry.count + 1 : 0;
  let errors = [];
  try {
    errors = currentLogEntry ? JSON.parse(currentLogEntry.error_list) : [];
  } catch (err) {
    // to capture parse errors - ok to keep errors as []
  }
  if (error) {
    errors.push(error);
    if (errors.length > ERROR_MESSAGE_CAP) errors.shift();
  }
  const logRecord = {
    count,
    record_type: change.record_type,
    error_list: JSON.stringify(errors),
    endpoint: JSON.stringify(endpoint),
  };
  if (data) {
    logRecord.data = JSON.stringify(data.metadata || {});
  }
  await models.ms1SyncLog.updateOrCreate(
    {
      record_id: change.record_id,
    },
    logRecord,
  );
}
