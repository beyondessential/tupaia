import { SyncSnapshotAttributes } from '@tupaia/sync';
import { post } from '../api';

export const pushOutgoingChanges = async (
  sessionId: string,
  changes: SyncSnapshotAttributes[],
) => {
  const PAGE_LIMIT = 100;
  let startOfPage = 0;
  let limit = PAGE_LIMIT; // TODO: Fix
  while (startOfPage < changes.length) {
    const endOfPage = Math.min(startOfPage + limit, changes.length);
    const page = changes.slice(startOfPage, endOfPage);

    // const startTime = Date.now();
    await post(sessionId, { page });
    // const endTime = Date.now();

    startOfPage = endOfPage;

    // TODO: Fix
    // limit = calculatePageLimit(limit, endTime - startTime);
  }
  await post(sessionId, { complete: true });
};
