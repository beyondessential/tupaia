import { calculatePageLimit, SyncSnapshotAttributes } from '@tupaia/sync';
import { post } from '../api';

export const pushOutgoingChanges = async (
  sessionId: string,
  changes: SyncSnapshotAttributes[],
): Promise<void> => {
  let startOfPage = 0;
  let limit = calculatePageLimit();
  while (startOfPage < changes.length) {
    const endOfPage = Math.min(startOfPage + limit, changes.length);
    const page = changes.slice(startOfPage, endOfPage);

    const startTime = Date.now();
    await post(sessionId, { page });
    const endTime = Date.now();

    startOfPage = endOfPage;

    limit = calculatePageLimit(limit, endTime - startTime);
  }
  await post(sessionId, { complete: true });
};
