/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import moment from 'moment-timezone';

import { SNAPSHOTS } from '../../constants';

export const pushSnapshots = async (snapshotRepo, branch, snapshots) => {
  const date = Date.now();
  const updateBranch = `beyondessential-bot/snapshot-update/${branch}_${date}`;
  await snapshotRepo.createBranchIfNotExists(branch);
  await snapshotRepo.createBranch(updateBranch, branch);

  const commitFiles = [{ path: SNAPSHOTS.pathInRepo, content: snapshots.toString() }];
  await snapshotRepo.commitFilesToBranch(updateBranch, commitFiles, 'Update snapshots');
  const prTitle = `${branch} snapshot update (${moment(date).utc().format()})`;

  const { html_url: pullRequestUrl } = await snapshotRepo.createPullRequest({
    base: branch,
    head: updateBranch,
    title: prTitle,
  });
  return { pullRequestUrl };
};
