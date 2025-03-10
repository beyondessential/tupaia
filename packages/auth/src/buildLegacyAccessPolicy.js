/* eslint-disable no-underscore-dangle */

/**
 * Builds a user's country level permissions in the legacy access policy format (see example at
 * bottom of this file), but without any geographical area or facility permissions (these were never
 * actually used)
 */
export const buildLegacyAccessPolicy = async (models, userId) => {
  const permissionGroupSets = await getPermissionGroupSets(models);

  const surveysPermissionTree = await getCountrySurveyPermissions(
    models,
    userId,
    permissionGroupSets,
  );

  return {
    permissions: {
      surveys: {
        _items: surveysPermissionTree,
      },
    },
  };
};

const getCountrySurveyPermissions = async (models, userId, permissionGroupSets) => {
  const userCountryPermissions = await models.userEntityPermission.fetchCountryPermissionGroups(
    userId,
  );

  const accessPolicyPermissions = {};

  for (let i = 0; i < userCountryPermissions.length; i++) {
    const countryPermission = userCountryPermissions[i];

    const { country_code: countryCode, permission_group_name: permissionGroup } = countryPermission;

    if (!accessPolicyPermissions[countryCode]) {
      accessPolicyPermissions[countryCode] = { _access: {} };
    }

    accessPolicyPermissions[countryCode]._access = {
      ...accessPolicyPermissions[countryCode]._access,
      ...permissionGroupSets[permissionGroup],
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

/**
 * Legacy access policy format
 * N.B. the code above builds a simplified version, as we never used permissions below country level,
 * and don't need to continue to support web-config-server (the 'reports' section of the tree)
 * {
 *  "permissions": {
 *    "surveys": {
 *      "_items": {
 *        "Country": {
 *          "_access": {
 *            "Permission Group": bool
 *          },
 *          "_items": {
 *            "Region": {
 *              "_access": {
 *		             "Permission Group": bool
 *              },
 *              "Region": {
 *                "_access": {
 *		               "Permission Group": bool
 *                }
 *              },
 *              "_items": {
 *                "Facility": {
 *                  "_access": {
 *		  	            "Permission Group": bool
 *                  },
 *                }
 *		          }
 *            }
 *          }
 *        }
 *      }
 *    },
 *    "reports": {
 *      "_items": {
 *        "Country": {
 *          "_access": {
 *            "Permission Group": bool
 *          },
 *          "_items": {
 *            "Region": {
 *              "_access": {
 *		            "Permission Group": bool
 *              },
 *              "Region": {
 *                "_access": {
 *		              "Permission Group": bool
 *                }
 *              },
 *              "_items": {
 *                "Facility": {
 *                  "_access": {
 *		  	            "Permission Group": bool
 *                  },
 *                }
 *	          	}
 *            }
 *          }
 *        }
 *      }
 *    }
 *  }
 *};
 */
