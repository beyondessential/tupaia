/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { singularise } from '@tupaia/utils';
import { RouteHandler } from '../RouteHandler';
import { resourceToRecordType } from '../../utilities';
import { extractResourceFromEndpoint } from './helpers';

export class CRUDHandler extends RouteHandler {
  constructor(req, res) {
    super(req, res);
    const { database, query, endpoint, models, accessPolicy, params } = req;
    this.database = database;
    this.query = query;
    this.models = models;
    this.accessPolicy = accessPolicy;
    this.resource = extractResourceFromEndpoint(endpoint);
    this.recordType = resourceToRecordType(this.resource);
    this.recordId = params.recordId; // undefined for multi record requests
    this.parentResource = params.parentResource;
    this.parentRecordType = resourceToRecordType(this.parentResource);
    this.parentRecordId = params.parentRecordId;
    this.model = this.models[singularise(this.resource)];
  }
}
