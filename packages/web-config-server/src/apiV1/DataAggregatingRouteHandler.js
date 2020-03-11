/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { RouteHandler } from './RouteHandler';
import { createAggregator } from '@tupaia/aggregator';
import { Aggregator } from '../aggregator';

/**
 * Interface class for handling routes that fetch data from an aggregator
 * buildResponse must be implemented
 */
export class DataAggregatingRouteHandler extends RouteHandler {
  constructor() {
    super();
    this.aggregator = createAggregator(Aggregator);
  }

  async handleRequest(req, res) {
    return super.handleRequest(req, res);
  }
}
