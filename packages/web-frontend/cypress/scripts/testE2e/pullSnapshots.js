/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { getLoggerInstance } from '@tupaia/utils';
import { SNAPSHOTS } from '../../constants';
import { Snapshots } from './Snapshots';

const selectPullBranch = async (snapshotRepo, branch) => {
  const logger = getLoggerInstance();

  if (await snapshotRepo.hasBranch(branch)) {
    logger.info(`A matching snapshot branch was found, using '${branch}'`);
    return branch;
  }

  const { default_branch: defaultBranch } = await snapshotRepo.getDetails();
  logger.info(`No matching snapshot branch found, defaulting to '${defaultBranch}'`);
  return defaultBranch;
};

export const pullSnapshots = async (snapshotRepo, branch) => {
  const pullBranch = await selectPullBranch(snapshotRepo, branch);
  const snapshotTree = await snapshotRepo.getFile(pullBranch, SNAPSHOTS.pathInRepo);
  return new Snapshots(snapshotTree);
};
