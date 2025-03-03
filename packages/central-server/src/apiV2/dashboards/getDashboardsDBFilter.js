import { RECORDS } from '@tupaia/database';
import { hasBESAdminAccess, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../permissions';
import { createDashboardRelationsDBFilter } from '../dashboardRelations';
import { mergeFilter } from '../utilities';

export const getDashboardsDBFilter = async (accessPolicy, models, criteria) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return criteria;
  }

  const dbConditions = { ...criteria };

  // Pull the list of dashboard relations we have access to,
  // then pull the corresponding dashboards
  const permissionRelationConditions = createDashboardRelationsDBFilter(accessPolicy, criteria);
  const permittedDashboardsFromRelations = await models.dashboard.find(
    permissionRelationConditions,
    {
      joinWith: RECORDS.DASHBOARD_RELATION,
      joinCondition: ['dashboard_relation.dashboard_id', 'dashboard.id'],
    },
  );
  const permittedDashboardIdsFromRelations = permittedDashboardsFromRelations.map(d => d.id);

  // Pull the list of all dashboards with country code that use has Tupaia Admin Panel access to
  const permittedCountryCodes = accessPolicy.getEntitiesAllowed(
    TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  );

  const permittedDashboards = await models.dashboard.find({
    root_entity_code: permittedCountryCodes,
  });

  const permittedDashboardIds = permittedDashboards.map(d => d.id);

  // Combine lists
  const combinedPermittedIds = [...permittedDashboardIdsFromRelations, ...permittedDashboardIds];

  dbConditions['dashboard.id'] = mergeFilter(combinedPermittedIds, dbConditions['dashboard.id']);

  return dbConditions;
};
