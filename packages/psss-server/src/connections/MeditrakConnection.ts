/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ApiConnection } from './ApiConnection';

const { MEDITRAK_SERVER_URL = 'http://localhost:8090/v2' } = process.env;

export class MeditrakConnection extends ApiConnection {
  baseUrl = MEDITRAK_SERVER_URL;
}
