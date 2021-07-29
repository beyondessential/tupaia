/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DataBroker } from '@tupaia/data-broker';

// TODO:
// - REST endpoint: Manual

const PERIOD_BETWEEN_SYNCS = 1 * 60 * 1000; // 1 minutes between syncs
const SERVICE_NAME = 'KoBo';

export async function startSyncWithKoBo(models) {
  // TODO: Allow disabling of KoBo sync
  // TODO: Can KoBo and DHIS share a dataBroker?
  const dataBroker = new DataBroker();
  await pullLatest(models, dataBroker);
  setInterval(() => syncWithKoBo(models, dataBroker), PERIOD_BETWEEN_SYNCS);
}

async function syncWithKoBo(models, dataBroker) {
  await pullLatest(models, dataBroker);
}

async function pullLatest(models, dataBroker) {
  const syncCursor = await models.syncCursor.findOne({ service_name: SERVICE_NAME });

  const koboData = await dataBroker.pull(
    {
      code: syncCursor.config.koboSurveys,
      type: dataBroker.getDataSourceTypes().SYNC_GROUP,
    },
    {
      startSubmissionTime: syncCursor.sync_time,
    },
  );

  // TODO: Push to database
  // TODO: Update syncCursor
}
