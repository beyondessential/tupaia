/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DataBroker } from '@tupaia/data-broker';
import { respond } from '@tupaia/utils';
import { syncWithKoBo } from './startSyncWithKoBo';

export async function manualKoBoSync(req, res) {
  const { models } = req;
  const { serviceCode } = req.query;

  const dataBroker = new DataBroker();
  await syncWithKoBo(models, dataBroker, serviceCode);

  respond(res, { message: 'KoBo sync triggered' });
}
