/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Service } from '../Service';
import { getServerName, getDhisApiInstance } from './getDhisApiInstance';

export class DhisService extends Service {
  getApi() {
    const serverName = getServerName(
      this.metadata.entityCode,
      this.dataSource.config.isDataRegional,
    );
    return getDhisApiInstance({ serverName });
  }

  async push() {
    const api = this.getApi();
    // TODO implement
  }

  async pull() {
    const api = this.getApi();
    // TODO implement
  }
}
