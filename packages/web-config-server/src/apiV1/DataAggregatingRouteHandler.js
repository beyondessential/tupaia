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
  constructor(req, res) {
    super(req, res);
    this.aggregator = createAggregator(Aggregator);
  }

  setPermissionGroups(permissionGroups) {
    this.aggregator.injectCheckEntityAccess(entityCode =>
      Promise.all(permissionGroups.map(p => this.req.userHasAccess(entityCode, p))),
    );
  }
}
