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
    const { recordId, parentRecordId } = this.params;
    this.parentResource = parentRecordId ? extractResourceFromEndpoint(this.endpoint) : undefined;
    this.parentRecordType = resourceToRecordType(this.parentResource);
    this.parentRecordId = parentRecordId;
    this.resource = parentRecordId
      ? extractChildResourceFromEndpoint(this.endpoint)
      : extractResourceFromEndpoint(this.endpoint);
    this.recordType = resourceToRecordType(this.resource);
    this.recordId = recordId; // undefined for multi record requests
    this.resourceModel = this.models[singularise(this.resource)];
  }
}
