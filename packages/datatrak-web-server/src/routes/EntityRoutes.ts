/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Route } from '@tupaia/server-boilerplate';
import camelcaseKeys from 'camelcase-keys';

export type EntityRequest = any;

const DEFAULT_FIELDS = ['id', 'parent_code', 'code', 'name', 'type'];

export class EntityRoute extends Route<EntityRequest> {
  public async buildResponse() {
    const { params, query, ctx } = this.req;
    const { entityId } = params;

    const { fields = DEFAULT_FIELDS } = query;
    const entity = this.req.models.entity.findById(entityId, { fields });

    return camelcaseKeys(entity, { deep: true });
  }
}
