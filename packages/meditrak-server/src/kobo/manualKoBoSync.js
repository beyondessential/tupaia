/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DataBroker } from '@tupaia/data-broker';
import { syncWithKoBo } from './startSyncWithKoBo';

export async function manualKoBoSync(req, res, next) {
  const { models } = req;

  const dataBroker = new DataBroker();
  await syncWithKoBo(models, dataBroker);

  next();
}
