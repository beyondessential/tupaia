/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { legacy_getDhisConfig } from '@tupaia/utils';
import { DhisApi } from './DhisApi';

const instances = {};

export const getDhisApiInstance = options => {
  const { serverName, serverUrl, serverReadOnly } = legacy_getDhisConfig(options);
  if (!instances[serverName]) {
    instances[serverName] = new DhisApi(serverName, serverUrl, serverReadOnly);
  }
  return instances[serverName];
};
