/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import { stringifyQuery } from '@tupaia/utils';

export const buildExportUrl = (req, resource, queryParams) =>
  stringifyQuery(`//${req.headers.host}${req.baseUrl}`, `export/${resource}`, queryParams);
