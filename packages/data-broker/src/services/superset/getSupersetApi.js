/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { SupersetApi } from '@tupaia/superset-api';

const instances = {};

/**
 * @param {} models
 * @param {SupersetInstance} supersetInstance
 * @return {Promise<SupersetApi>}
 */
export const getSupersetApiInstance = async (models, supersetInstance) => {
  const { code: serverName, config } = supersetInstance;
  const { baseUrl, insecure } = config;

  if (!instances[serverName]) {
    instances[serverName] = new SupersetApi(serverName, baseUrl, insecure);
  }

  return instances[serverName];
};
