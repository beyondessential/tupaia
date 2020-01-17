/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DataBroker } from '@tupaia/data-broker';

export class Aggregator {
  constructor() {
    this.dataBroker = new DataBroker();
  }
}
