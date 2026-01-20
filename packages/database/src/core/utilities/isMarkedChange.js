/**
 * Indicates whether a change notification was "marked" (manually triggered),
 * rather than a true database change
 */
export const isMarkedChange = changeDetails => {
  const { type, old_record: oldRecord, new_record: newRecord } = changeDetails;
  // If all fields are the same in an `update` change, the change was marked, since true DB update
  // notifications require at least one changed field
  return type === 'update' && JSON.stringify(oldRecord) === JSON.stringify(newRecord);
};
