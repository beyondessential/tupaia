/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { execSync } from 'child_process';
import {} from 'dotenv/config';
import GithubApi from 'github-api';

import { getLoggerInstance, RemoteGitRepo, requireEnv } from '@tupaia/utils';
import { SNAPSHOTS } from '../../constants';
import { pullSnapshots } from './pullSnapshots';
import { pushSnapshots } from './pushSnapshots';
import { Snapshots } from './Snapshots';

const runPackageScript = script =>
  execSync(`yarn workspace @tupaia/web-frontend ${script}`, { stdio: 'inherit' });

const runTestsAndCatchErrors = () => {
  const record = !!process.env.CYPRESS_RECORD_KEY;

  let cypressError;
  try {
    runPackageScript(`cypress:run --record ${record}`);
  } catch (error) {
    // Note: ideally we would only catch test assertion errors,
    // and still throw runtime/syntax errors etc.
    // Unfortunately we haven't found an easy way to distinguish between the two in this occasion
    cypressError = error;
  }

  return cypressError;
};

const getCurrentLocalBranch = () =>
  execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8', stdio: 'pipe' }).split('\n')[0];

export const getSnapshotBranch = () => {
  const branch = process.env.CI_BRANCH || getCurrentLocalBranch();
  return branch.replace(/-e2e$/, '');
};

export const getSnapshotRepo = () => {
  const gitHub = new GithubApi({ token: requireEnv('GITHUB_ACCESS_TOKEN') });
  return RemoteGitRepo.connect(gitHub, SNAPSHOTS.repoUrl);
};

/**
 * Runs e2e tests using the following steps:
 * 1. Pull snapshots
 * 2. Generate config
 * 3. Run tests using the pulled snapshots
 * 4. If new snapshots were captured during tests, push them
 */
export const testE2e = async () => {
  const logger = getLoggerInstance();
  logger.success('Running e2e tests for web-frontend');

  const repo = getSnapshotRepo();
  const branch = getSnapshotBranch();

  const { repoUrl } = SNAPSHOTS;
  logger.success(`Pulling snapshots from ${repoUrl}...`);
  const snapshots = await pullSnapshots(repo, branch);
  // Store snapshots so that they can be used during tests
  snapshots.export(SNAPSHOTS.path);

  runPackageScript('cypress:generate-config');

  // Hold error throwing so that snapshots can be pushed
  const testError = runTestsAndCatchErrors();
  const snapshotsAfterTest = Snapshots.import(SNAPSHOTS.path);
  const newSnapshots = snapshotsAfterTest.extractSnapshotsByKey(SNAPSHOTS.newKey, {
    renameKey: SNAPSHOTS.key,
  });

  if (newSnapshots.isEmpty()) {
    logger.info('New snapshots are empty. Probably something went very wrong, skipping push');
  } else if (newSnapshots.equals(snapshots)) {
    logger.info('No changes in snapshots, skipping push');
  } else {
    logger.success(`Pushing new snapshots to ${repoUrl}...`);
    const { pullRequestUrl } = await pushSnapshots(repo, branch, newSnapshots);
    logger.info(`PR created: ${pullRequestUrl}`);
  }

  if (testError) {
    throw testError;
  }
};
