/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DhisApi } from '@tupaia/dhis-api';
import { DataService } from '../DataService';

export class DhisService extends DataService {
  constructor(serverName) {
    super();
    this.api = new DhisApi(serverName);
  }
}
