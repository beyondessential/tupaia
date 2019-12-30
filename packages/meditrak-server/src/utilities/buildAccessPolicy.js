/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

/* eslint-disable no-underscore-dangle, camelcase */
import keyBy from 'lodash/keyBy';

export const buildAccessPolicy = async (models, userId) => {
  const permissionGroupSets = await getPermissionGroupSets(models);
  const countries = await models.country.find({
    code: {
      comparisonType: 'where',
      comparator: '!=',
      comparisonValue: 'NC', // @todo get rid of 'No Country' https://github.com/beyondessential/meditrak-server/issues/105
    },
  });

  const surveysPermissionTree = await getCountrySurveyPermissions(
    models,
    userId,
    permissionGroupSets,
  );

  await buildPermissionTreePerCountry(
    models,
    userId,
    permissionGroupSets,
    (countryCode, permissionTree) => {
      if (!surveysPermissionTree[countryCode]) {
        surveysPermissionTree[countryCode] = {};
      }

      surveysPermissionTree[countryCode]._items = permissionTree._items;
    },
  );

  // Deep clone survey permission tree and use as base for report permissions.
  const reportsPermissionTree = JSON.parse(JSON.stringify(surveysPermissionTree));

  // Note: Surveys corresponds to surveys a user can write to and reports corresponds to
  // data a user is allowed to view in dashboards such as those on tupaia.org.
  return {
    permissions: {
      surveys: {
        _items: surveysPermissionTree,
      },
      reports: {
        _items: reportsPermissionTree,
      },
    },
  };
};

const buildPermissionTreePerCountry = async (
  models,
  userId,
  permissionGroupSets,
  countryCallback,
) => {
  const geographicalAreaPermissionTree = {};

  const userGeographicalAreaPermissions = await models.userGeographicalAreaPermission.find({
    user_id: userId,
  });

  const geographicalAreaAncestorSets = await Promise.all(
    userGeographicalAreaPermissions.map(userGeographicalAreaPermission =>
      userGeographicalAreaPermission.getGeographicalAreaPath(),
    ),
  );

  const userFacilityPermissions = await models.userFacilityPermission.find({
    user_id: userId,
  });

  const facilityAncestorSets = await Promise.all(
    userFacilityPermissions.map(userFacilityPermission =>
      userFacilityPermission.getPermissionAncestorPath(),
    ),
  );

  const permissionItems = [...userGeographicalAreaPermissions, ...userFacilityPermissions];
  const trees = [...geographicalAreaAncestorSets, ...facilityAncestorSets];

  permissionItems.forEach((userGeographicalAreaPermission, index) => {
    const { permission_group_name } = userGeographicalAreaPermission;
    const tree = trees[index];
    const country = tree.pop();

    if (!geographicalAreaPermissionTree[country.code]) {
      geographicalAreaPermissionTree[country.code] = {};
    }

    let currentPermissionTreeNode = geographicalAreaPermissionTree[country.code];

    // Trees are arranged from deepest child to parent so reverse them to go from
    // deepest parent to child.
    tree.reverse().forEach((treeItem, treeIndex) => {
      const organisationUnitCode = treeItem.organisationUnitCode || 'ORG_UNIT_CODE_MISSING';

      if (!currentPermissionTreeNode._items) {
        currentPermissionTreeNode._items = {};
      }
      if (!currentPermissionTreeNode._items[organisationUnitCode]) {
        currentPermissionTreeNode._items[organisationUnitCode] = {};
      }

      currentPermissionTreeNode = currentPermissionTreeNode._items[organisationUnitCode];

      // Reached the deepest child.
      if (treeIndex === tree.length - 1) {
        if (!currentPermissionTreeNode._access) {
          currentPermissionTreeNode._access = {};
        }

        currentPermissionTreeNode._access = {
          ...currentPermissionTreeNode._access,
          ...permissionGroupSets[permission_group_name],
        };
      }
    });
  });

  Object.keys(geographicalAreaPermissionTree).forEach(countryCode => {
    const tree = geographicalAreaPermissionTree[countryCode];
    countryCallback(countryCode, tree);
  });
};

const getCountrySurveyPermissions = async (models, userId, permissionGroupSets) => {
  const userCountryPermissions = await models.userCountryPermission.find({
    user_id: userId,
  });

  const accessPolicyPermissions = {};

  const permissionGroups = await Promise.all(
    userCountryPermissions.map(userCountryPermission => userCountryPermission.permissionGroup()),
  );
  const keyedPermissionGroups = keyBy(permissionGroups, 'id');

  for (let i = 0; i < userCountryPermissions.length; i++) {
    const countryPermission = userCountryPermissions[i];

    const { country_code, permission_group_id } = countryPermission;
    const permissionGroup = keyedPermissionGroups[permission_group_id];

    if (!accessPolicyPermissions[country_code]) {
      accessPolicyPermissions[country_code] = { _access: {} };
    }

    accessPolicyPermissions[country_code]._access = {
      ...accessPolicyPermissions[country_code]._access,
      ...permissionGroupSets[permissionGroup.name],
    };
  }

  return accessPolicyPermissions;
};

const getPermissionGroupSets = async models => {
  const permissionGroupSets = {};

  const allPermissionGroups = await models.permissionGroup.all();
  const permissionGroupPermissionTrees = await Promise.all(
    allPermissionGroups.map(async permissionGroup => permissionGroup.getChildTree()),
  );

  allPermissionGroups.forEach((permissionGroup, index) => {
    const set = {
      [permissionGroup.name]: true,
    };

    permissionGroupPermissionTrees[index].forEach(treeItem => {
      set[treeItem.name] = true;
    });

    permissionGroupSets[permissionGroup.name] = set;
  });

  return permissionGroupSets;
};
