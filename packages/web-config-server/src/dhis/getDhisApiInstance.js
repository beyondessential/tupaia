/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { getDhisConfig } from '@tupaia/utils';
import { DhisApi } from './DhisApi';

const instances = {};

export const getDhisApiInstance = options => {
  const { serverName, serverUrl, serverSyncEnable } = getDhisConfig(options);
  if (!instances[serverName]) {
    instances[serverName] = new DhisApi(serverName, serverUrl, serverSyncEnable);
  }
  return instances[serverName];
};
