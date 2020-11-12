import { buildDataElementsFetch } from './dataElements';
import { buildDataGroupsFetch } from './dataGroups';

export const fetchBuilders = {
  dataElements: buildDataElementsFetch,
  dataGroups: buildDataGroupsFetch,
};
