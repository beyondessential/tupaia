/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { setupModelRegistry } from '@tupaia/database';
import { DhisService } from './services';

export class DataBroker {
  constructor() {
    const models = setupModelRegistry();
    this.dataSource = models.dataSource;
    // each service below can either push, pull, or both
    this.services = {
      regionalDhis: new DhisService('regional'),
      tongaDhis: new DhisService('tonga'),
    };
  }
}
