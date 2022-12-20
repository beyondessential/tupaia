/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { GETHandler } from '../GETHandler';

export class GETEntityRelations extends GETHandler {
  // TODO we should allow a table to be joined multiple times (here for child_id and parent_id)
  customJoinConditions = {
    entity: ['entity.id', 'entity_relation.child_id'],
    entity_hierarchy: ['entity_hierarchy.id', 'entity_relation.entity_hierarchy_id'],
  };

  // TODO add permissions - see GetDashboardRelations
  async assertUserHasAccess() {
    await this.assertPermissions(() => true);
  }

  // TODO add tests if this is going to be used
}
