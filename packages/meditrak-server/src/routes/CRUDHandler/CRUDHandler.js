/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { singularise } from '@tupaia/utils';
import { RouteHandler } from '../RouteHandler';
import { resourceToRecordType } from '../../utilities';
import { extractResourceFromEndpoint, extractChildResourceFromEndpoint } from './helpers';

export class CRUDHandler extends RouteHandler {
  constructor(req, res) {
    super(req, res);
    const { database, query, endpoint, models, accessPolicy, params } = req;
    this.database = database;
    this.query = query;
    this.models = models;
    this.accessPolicy = accessPolicy;
    this.parentResource = params.parentResource
      ? params.parentResource
      : extractResourceFromEndpoint(endpoint);
    this.parentRecordType = resourceToRecordType(this.parentResource);
    this.parentRecordId = params.parentRecordId;
    this.resource = this.parentRecordId
      ? extractChildResourceFromEndpoint(endpoint)
      : extractResourceFromEndpoint(endpoint);
    this.recordType = resourceToRecordType(this.resource);
    this.recordId = params.recordId; // undefined for multi record requests
    this.resourceModel = this.models[singularise(this.resource)];
  }
}
