/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class ProjectType extends DatabaseType {
  static databaseType = TYPES.PROJECT;

  async permissionGroups() {
    return this.otherModels.permissionGroup.find({ name: this.user_groups });
  }

  async entity() {
    return this.otherModels.entity.findById(this.entity_id);
  }
}

export class ProjectModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return ProjectType;
  }

  async getAllProjectDetails() {
    return this.database.executeSql(`
      select p.id, p.code,
            to_json(sub.child_id) AS entity_ids,
            e."name", p.description,
            p.sort_order, p.user_groups,
            p.entity_id, p.image_url,
            p.logo_url, p.dashboard_group_name,
            p.default_measure
      from project p
        left join entity e
          on p.entity_id = e.id
        left join (select parent_id, json_agg(child_id) as child_id from entity_relation er group by parent_id) sub
          on p.entity_id = sub.parent_id
    `);
  }
}
