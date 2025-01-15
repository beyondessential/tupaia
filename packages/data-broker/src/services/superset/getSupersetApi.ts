import { SupersetApi } from '@tupaia/superset-api';
import { DataBrokerModelRegistry, SupersetInstance } from '../../types';

const instances: Record<string, SupersetApi> = {};

export const getSupersetApiInstance = async (
  models: DataBrokerModelRegistry,
  supersetInstance: SupersetInstance,
) => {
  const { code: serverName, config } = supersetInstance;
  const { baseUrl } = config;

  if (!instances[serverName]) {
    instances[serverName] = new SupersetApi(serverName, baseUrl);
  }

  return instances[serverName];
};
