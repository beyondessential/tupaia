/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { setupModelRegistry } from '@tupaia/database';
import { DhisService, SERVICE_TYPES } from './services';
import * as modelClasses from './models';

export class DataBroker {
  constructor() {
    this.models = setupModelRegistry(modelClasses);
  }

  getServiceForDataSource = (dataSource, metadata) => {
    const { service: serviceType } = dataSource;
    switch (serviceType) {
      case SERVICE_TYPES.DHIS: {
        return new DhisService(dataSource, metadata);
      }
      default:
        throw new Error(`The data service ${serviceType} is not currently supported`);
    }
  };

  async push(code, data) {
    const dataSource = await this.models.dataSource.findOne({ code });
    const dataService = this.getServiceForDataSource(dataSource, data);
    return dataService.push();
  }

  async pull(code, metadata) {
    const dataSource = await this.models.dataSource.findOne({ code });
    const dataService = this.getServiceForDataSource(dataSource, metadata);
    return dataService.pull();
  }
}
