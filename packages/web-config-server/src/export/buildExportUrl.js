/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import { stringifyDhisQuery } from '@tupaia/dhis-api';

export const buildExportUrl = (req, resource, query) =>
  `//${req.headers.host}${req.baseUrl}/export/${resource}${stringifyDhisQuery(query)}`;
