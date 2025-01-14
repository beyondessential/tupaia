import { RECORDS } from '@tupaia/database';
import { hasBESAdminAccess } from '../../permissions';
import { createDashboardRelationsDBFilter } from '../dashboardRelations';
import { mergeFilter } from '../utilities';
import { getPermittedDashboardItems } from './getPermittedDashboardItems';

export const createDashboardItemsDBFilter = async (accessPolicy, models, criteria) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return criteria;
  }

  const dbConditions = { ...criteria };

  // Pull the list of dashboard relations we have access to,
  // then pull the corresponding dashboard items
  const permittedRelationConditions = createDashboardRelationsDBFilter(accessPolicy, criteria);
  const permittedDashboardItemsFromRelations = await models.dashboardItem.find(
    permittedRelationConditions,
    {
      joinWith: RECORDS.DASHBOARD_RELATION,
      joinCondition: ['dashboard_relation.child_id', 'dashboard_item.id'],
    },
  );
  const permittedDashboardItemsFromRelationsIds = permittedDashboardItemsFromRelations.map(
    d => d.id,
  );

  const permittedDashboardItems = await getPermittedDashboardItems(accessPolicy, models);

  dbConditions['dashboard_item.id'] = mergeFilter(
    [...permittedDashboardItemsFromRelationsIds, ...permittedDashboardItems],
    dbConditions['dashboard_item.id'],
  );

  return dbConditions;
};
