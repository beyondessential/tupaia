/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { singularise } from '@tupaia/utils';
import { RouteHandler } from '../RouteHandler';
import { resourceToRecordType } from '../../utilities';
import { extractResourceFromPath, extractChildResourceFromPath } from './helpers';

export class CRUDHandler extends RouteHandler {
  constructor(req, res) {
    super(req, res);
    const { recordId, parentRecordId } = this.params;
    this.parentResource = parentRecordId ? extractResourceFromPath(this.path) : undefined;
    this.parentRecordType = resourceToRecordType(this.parentResource);
    this.parentRecordId = parentRecordId;
    this.resource = parentRecordId
      ? extractChildResourceFromPath(this.path)
      : extractResourceFromPath(this.path);
    this.recordType = resourceToRecordType(this.resource);
    this.recordId = recordId; // undefined for multi record requests
    this.resourceModel = this.models[singularise(this.resource)];
  }
}
