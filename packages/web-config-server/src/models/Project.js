/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 **/
import { ProjectModel as CommonProjectModel } from '@tupaia/database';

export class ProjectModel extends CommonProjectModel {
  async getAllProjectDetails() {
    return this.database.executeSql(`
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
