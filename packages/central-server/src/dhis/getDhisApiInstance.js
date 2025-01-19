import { DhisApi } from '@tupaia/dhis-api';
import { legacy_getDhisConfig } from '@tupaia/utils';

const instances = {};

export const getDhisApiInstance = options => {
  const { serverName, serverUrl, serverReadOnly } = legacy_getDhisConfig(options);
  if (!instances[serverName]) {
    instances[serverName] = new DhisApi(serverName, serverUrl, serverReadOnly);
  }
  return instances[serverName];
};
