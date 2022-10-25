/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { respond } from '@tupaia/utils';
import { generateId } from '@tupaia/database';

export async function editDashboard(req, res) {
  req.flagPermissionsChecked();

  const payload = req.body;
  const { models } = req;

  models.wrapInTransaction(async transactingModels => {
    // first get ids, as we only have codes, and we will delete these records
    for (const item of payload.items) {
      const { code } = item;
      const record = await transactingModels.dashboardItem.findOne({ code });
      item.id = record.id;
    }

    // delete existing
    await transactingModels.dashboardRelation.delete({ dashboard_id: payload.dashboardId });

    let i = 0;
    for (const item of payload.items) {
      i++;
      await transactingModels.dashboardRelation.create({
        id: generateId(),
        dashboard_id: payload.dashboardId,
        child_id: item.id,
        entity_types: ['country'],
        project_codes: ['ehealth_nauru'],
        permission_groups: ['COVID-19 Nauru'],
        sort_order: i,
      });
      // console.log('dashboardItem', code, id);
    }
  });

  respond(res, { message: 'Success' }, 200);
}
