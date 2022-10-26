/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { respond } from '@tupaia/utils';
import { generateId, TYPES } from '@tupaia/database';

export async function editDashboard(req, res) {
  req.flagPermissionsChecked();

  const payload = req.body;
  const { models } = req;

  models.wrapInTransaction(async transactingModels => {
    // first get ids, as we only have codes, and we will delete these records
    for (const item of payload.items) {
      const { code } = item;
      const [record] = await transactingModels.database.find(
        TYPES.DASHBOARD_ITEM,
        { [`${TYPES.DASHBOARD_ITEM}.code`]: code },
        {
          columns: [`${TYPES.DASHBOARD_ITEM}.id`, `${TYPES.DASHBOARD_ITEM}.config`],
        },
      );
      item.config = record.config;
      item.config.name = item.name;
      item.id = record.id;
    }

    // delete existing
    await transactingModels.dashboardRelation.delete({ dashboard_id: payload.dashboardId });

    let i = 0;
    for (const item of payload.items) {
      i++;
      // update name
      await transactingModels.dashboardItem.updateById(item.id, { config: item.config });

      // rebuild dashboard relations
      await transactingModels.dashboardRelation.create({
        id: generateId(),
        dashboard_id: payload.dashboardId,
        child_id: item.id,
        entity_types: ['country'],
        project_codes: ['ehealth_nauru'],
        permission_groups: ['COVID-19 Nauru'],
        sort_order: i,
      });
    }
  });
  respond(res, { message: 'Success' }, 200);
}
