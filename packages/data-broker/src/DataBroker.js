/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { getServiceFromDataSource } from './services';
import { getModels } from './getModels';

export class DataBroker {
  constructor() {
    this.models = getModels();
  }

  async push(code, data) {
    const dataSource = await this.models.dataSource.findOne({ code });
    const dataService = getServiceFromDataSource(dataSource, data);
    return dataService.push();
  }

  async pull(code, metadata) {
    const dataSource = await this.models.dataSource.findOne({ code });
    const dataService = getServiceFromDataSource(dataSource, metadata);
    return dataService.pull();
  }
}
