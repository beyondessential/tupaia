/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DataService } from '../DataService';
import { getServerName, getDhisApiInstance } from './getDhisApiInstance';
import { DhisPusher } from './DhisPusher';
import { DhisPuller } from './DhisPuller';

export class DhisService extends DataService {
  constructor(dataSource, metadata) {
    super();
    this.dataSource = dataSource;
    this.metadata = metadata;
  }

  getApi() {
    const serverName = getServerName(
      this.metadata.entityCode,
      this.dataSource.config.isDataRegional,
    );
    return getDhisApiInstance({ serverName });
  }

  async push(value) {
    const api = this.getApi();
    const pusher = new DhisPusher(api, this.dataSource, this.metadata, value);
    return pusher.push();
  }

  async pull() {
    const api = this.getApi();
    const puller = new DhisPuller(api, this.dataSource, this.metadata);
    return puller.pull();
  }
}
