import { DhisApi } from './DhisApi';
import { getDhisConfig } from '@tupaia/utils';

const instances = {};

export const getDhisApiInstance = options => {
  const { serverName, serverUrl } = getDhisConfig(options);
  if (!instances[serverName]) {
    instances[serverName] = new DhisApi(serverName, serverUrl);
  }
  return instances[serverName];
};
