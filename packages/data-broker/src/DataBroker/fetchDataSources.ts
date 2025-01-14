import { DataBrokerModelRegistry } from '../types';

const checkRequestedVsFound = (requested: string[], found: string[], description: string) => {
  if (found.length === 0) {
    throw new Error(`None of the following ${description} exist: ${requested}`);
  }
  const notFound = requested.filter(c => !found.includes(c));
  if (notFound.length > 0) {
    // eslint-disable-next-line no-console
    console.warn(`Could not find the following ${description}: ${notFound}`);
  }
};

export const fetchDataElements = async (models: DataBrokerModelRegistry, codes: string[]) => {
  if (codes.length === 0) {
    throw new Error('Please provide at least one existing data element code');
  }
  const dataElements = await models.dataElement.find({ code: codes });
  const foundCodes = dataElements.map(({ code }) => code);
  checkRequestedVsFound(codes, foundCodes, 'data elements');
  return dataElements;
};

export const fetchDataGroups = async (models: DataBrokerModelRegistry, codes: string[]) => {
  if (codes.length === 0) {
    throw new Error('Please provide at least one existing data group code');
  }
  const dataGroups = await models.dataGroup.find({ code: codes });
  const foundCodes = dataGroups.map(({ code }) => code);
  checkRequestedVsFound(codes, foundCodes, 'data groups');
  return dataGroups;
};

export const fetchSyncGroups = async (models: DataBrokerModelRegistry, codes: string[]) => {
  if (codes.length === 0) {
    throw new Error('Please provide at least one existing sync group code');
  }
  const syncGroups = await models.dataServiceSyncGroup.find({ code: codes });
  const foundCodes = syncGroups.map(({ code }) => code);
  checkRequestedVsFound(codes, foundCodes, 'sync groups');
  return syncGroups;
};
