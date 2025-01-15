import { stringifyQuery } from '@tupaia/utils';

export const buildExportUrl = (resource, queryParams) =>
  stringifyQuery('', `export/${resource}`, queryParams);
