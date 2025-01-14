import { QUERY_CONJUNCTIONS, RECORDS } from '@tupaia/database';
import { hasBESAdminAccess } from '../../permissions';
import {
  hasAccessToEntityForVisualisation,
  hasTupaiaAdminAccessToEntityForVisualisation,
  mergeMultiJoin,
} from '../utilities';

const { RAW } = QUERY_CONJUNCTIONS;

export const hasDashboardRelationGetPermissions = async (
  accessPolicy,
  models,
  permissionGroups,
  entityCode,
) => {
  const entity = await models.entity.findOne({ code: entityCode });
  const permissionGroupAccessResults = await Promise.all(
    permissionGroups.map(async pg =>
      hasAccessToEntityForVisualisation(accessPolicy, models, entity, pg),
    ),
  );
  return permissionGroupAccessResults.some(pg => pg === true);
};

export const hasDashboardRelationEditPermissions = async (
  accessPolicy,
  models,
  permissionGroups,
  entityCode,
) => {
  const entity = await models.entity.findOne({ code: entityCode });

  // users should all the permission group access (that's why using every() here)
  const permissionGroupAccessResults = await Promise.all(
    permissionGroups.map(async pg =>
      hasAccessToEntityForVisualisation(accessPolicy, models, entity, pg),
    ),
  );
  const hasTupaiaAdminAccess = await hasTupaiaAdminAccessToEntityForVisualisation(
    accessPolicy,
    models,
    entity,
  );

  return permissionGroupAccessResults.every(pg => pg === true) && hasTupaiaAdminAccess;
};

export const assertDashboardRelationGetPermissions = async (
  accessPolicy,
  models,
  dashboardRelationId,
) => {
  const dashboardRelation = await models.dashboardRelation.findById(dashboardRelationId);
  const dashboard = await models.dashboard.findById(dashboardRelation.dashboard_id);

  // To view a dashboard relation, the user has to have any permission groups (specified in relation) access to the
  // root entity code of the dashboard
  if (
    await hasDashboardRelationGetPermissions(
      accessPolicy,
      models,
      dashboardRelation.permission_groups,
      dashboard.root_entity_code,
    )
  ) {
    return true;
  }

  throw new Error(
    `Requires any of the permission groups (${dashboardRelation.permission_groups.toString()}) access to the dashboard root entity code '${
      dashboard.root_entity_code
    }'`,
  );
};

export const assertDashboardRelationEditPermissions = async (
  accessPolicy,
  models,
  dashboardRelationId,
) => {
  const dashboardRelation = await models.dashboardRelation.findById(dashboardRelationId);
  const dashboard = await models.dashboard.findById(dashboardRelation.dashboard_id);

  // To edit a dashboard relation, the user has to have all permission groups (specified in relation) access to the
  // root entity code of the dashboard
  if (
    !(await hasDashboardRelationEditPermissions(
      accessPolicy,
      models,
      dashboardRelation.permission_groups,
      dashboard.root_entity_code,
    ))
  ) {
    throw new Error(
      `Requires all of the permission groups (${dashboardRelation.permission_groups.toString()}) access to the dashboard root entity code '${
        dashboard.root_entity_code
      }', and have Tupaia Admin Panel access to '${dashboard.root_entity_code}'`,
    );
  }

  return true;
};

export const assertDashboardRelationCreatePermissions = async (
  accessPolicy,
  models,
  { dashboard_id: dashboardId },
) => {
  const dashboard = await models.dashboard.findById(dashboardId);
  if (!dashboard) {
    throw new Error(`Cannot find dashboard with id ${dashboardId}`);
  }

  const entity = await models.entity.findOne({ code: dashboard.root_entity_code });

  if (!(await hasTupaiaAdminAccessToEntityForVisualisation(accessPolicy, models, entity))) {
    throw new Error(
      `Requires Tupaia Admin Panel access to the dashboard root entity code '${dashboard.root_entity_code}'`,
    );
  }

  return true;
};

export const createDashboardRelationsDBFilter = (accessPolicy, criteria) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return criteria;
  }

  const allPermissionGroups = accessPolicy.getPermissionGroups();
  const countryCodesByPermissionGroup = Object.fromEntries(
    allPermissionGroups.map(pg => [pg, accessPolicy.getEntitiesAllowed(pg)]),
  );

  const dbConditions = { ...criteria };
  dbConditions[RAW] = {
    sql: `
    (
      (
        -- look up the country code of the entity, and see whether it's in the user's list of countries
        -- for the appropriate permission group
        ARRAY(
          SELECT DISTINCT e1.country_code
          FROM entity e1
          INNER JOIN dashboard d1
            ON e1.code = d1.root_entity_code
          INNER JOIN dashboard_relation dr1
            ON dr1.dashboard_id = d1.id
          WHERE dr1.id = "dashboard_relation".id
        )::TEXT[]
        &&
        ARRAY(
          SELECT DISTINCT TRIM('"' FROM JSON_ARRAY_ELEMENTS(?::JSON->dr2.permission_group)::TEXT)
          FROM (SELECT unnest(permission_groups) AS permission_group
                FROM dashboard_relation subdr1
                WHERE subdr1.id = "dashboard_relation".id) dr2
        )
      -- for projects, pull the country codes from the child entities and check that there is overlap
      -- with the user's list of countries for the appropriate permission group (i.e., they have
      -- access to at least one country within the project)
      OR (
        ARRAY(
          SELECT DISTINCT e3.country_code
          FROM entity e3
          INNER JOIN entity_relation er3
            ON e3.id = er3.child_id
          INNER JOIN project p3
            ON  er3.parent_id = p3.entity_id
            AND er3.entity_hierarchy_id = p3.entity_hierarchy_id
          INNER JOIN dashboard d3
            ON p3.code = d3.root_entity_code
          INNER JOIN dashboard_relation dr3
            ON dr3.dashboard_id = d3.id
          WHERE dr3.id = "dashboard_relation".id
        )::TEXT[]
        &&
        ARRAY(
          SELECT DISTINCT TRIM('"' FROM JSON_ARRAY_ELEMENTS(?::JSON->dr4.permission_group)::TEXT)
          FROM (SELECT unnest(permission_groups) AS permission_group
                FROM dashboard_relation subdr2
                WHERE subdr2.id = "dashboard_relation".id) dr4
        )
      )
    )
  )`,
    parameters: [
      JSON.stringify(countryCodesByPermissionGroup),
      JSON.stringify(countryCodesByPermissionGroup),
    ],
  };

  return dbConditions;
};

export const createDashboardRelationsViaParentDashboardDBFilter = (
  accessPolicy,
  criteria,
  options,
  dashboardId,
) => {
  const dbConditions = createDashboardRelationsDBFilter(accessPolicy, criteria);
  dbConditions['dashboard.id'] = dashboardId;

  const dbOptions = { ...options };
  dbOptions.multiJoin = mergeMultiJoin(
    [
      {
        joinWith: RECORDS.DASHBOARD,
        joinCondition: ['dashboard_relation.dashboard_id', 'dashboard.id'],
      },
    ],
    dbOptions.multiJoin,
  );

  return { dbConditions, dbOptions };
};

export const createDashboardRelationsViaParentDashboardItemDBFilter = (
  accessPolicy,
  criteria,
  options,
  dashboardItemId,
) => {
  const dbConditions = createDashboardRelationsDBFilter(accessPolicy, criteria);
  dbConditions['dashboard_item.id'] = dashboardItemId;

  const dbOptions = { ...options };
  dbOptions.multiJoin = mergeMultiJoin(
    [
      {
        joinWith: RECORDS.DASHBOARD_ITEM,
        joinCondition: ['dashboard_relation.child_id', 'dashboard_item.id'],
      },
    ],
    dbOptions.multiJoin,
  );

  return { dbConditions, dbOptions };
};
