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
  ];

  static async getProjectDetails() {
    return Project.database.executeSql(`
      select p.id, p.code, 
            to_json(sub.to_id) AS entity_ids, 
            E."name", p.description, 
            p.sort_order, p.user_groups, 
            p.entity_id, p.image_url, 
            p.logo_url, p.dashboard_group_name, 
            p.default_measure 
      from Project p 
        left join Entity E 
          on p.entity_id = e.id 
        left join (select from_id, json_agg(to_id) as to_id from entity_relation er group by from_id) sub 
          on p.entity_id = sub.from_id
    `);
  }

  static async getChildIds(id) {
    return Project.database.executeSql(
      `
      select ep.to_id as childId
      from entity_relation ep
      where ep.from_id = ?    
      `,
      id,
    );
  }
}
