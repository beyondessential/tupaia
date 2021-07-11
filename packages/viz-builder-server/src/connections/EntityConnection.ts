/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { NonSessionApiConnection } from './NonSessionApiConnection';

const { ENTITY_API_URL = 'http://localhost:8050/v1' } = process.env;

export class EntityConnection extends NonSessionApiConnection {
  baseUrl = ENTITY_API_URL;
}
