import omitDeep from 'omit-deep';

export const stripUpdatedAtSyncTickFromObject = obj =>
  omitDeep(obj, ['updatedAtSyncTick', 'updated_at_sync_tick']);

export const stripUpdatedAtSyncTickFromArray = array => {
  if (!Array.isArray(array)) {
    throw new Error('stripUpdatedAtSyncTickFromArray expects an array');
  }
  return array.map(stripUpdatedAtSyncTickFromObject);
};
