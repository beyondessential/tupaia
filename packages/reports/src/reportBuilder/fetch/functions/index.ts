import { buildDataElementFetch } from './dataElement';
import { buildDataGroupFetch } from './dataGroup';

export const fetchBuilders = {
  dataElements: buildDataElementFetch,
  dataGroups: buildDataGroupFetch,
};
