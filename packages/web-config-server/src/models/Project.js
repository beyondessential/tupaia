/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 **/
import { TYPES } from '@tupaia/database';
import { BaseModel } from './BaseModel';

export class Project extends BaseModel {
  static databaseType = TYPES.PROJECT;

  static fields = [
    'id',
    'code',
    'user_groups',
    'entity_id',
    'description',
    'sort_order',
    'image_url',
    'logo_url',
    'dashboard_group_name',
    'default_measure',
    'entity_hierarchy_id',
  ];

  static async getProjectDetails() {
    return Project.database.executeSql(`
      select p.id, p.code,
            to_json(sub.child_id) AS entity_ids,
            E."name", p.description,
            p.sort_order, p.user_groups,
            p.entity_id, p.image_url,
            p.logo_url, p.dashboard_group_name,
            p.default_measure
      from Project p
        left join Entity E
          on p.entity_id = e.id
        left join (select parent_id, json_agg(child_id) as child_id from entity_relation er group by parent_id) sub
          on p.entity_id = sub.parent_id
    `);
  }
}
