/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export class AccessPolicyBuilder {
  constructor(models) {
    this.models = models;
    this.cachedPolicyPromises = {};
    this.setupCacheInvalidation();
  }

  setupCacheInvalidation() {
    // if a user entity permission record is changed, make sure we rebuild the associated user's
    // access policy next time it is requested
    this.models.userEntityPermission.addChangeHandler(({ record }) => {
      this.cachedPolicyPromises[record.user_id] = null;
    });
  }

  async getPolicyForUser(userId) {
    if (!this.cachedPolicyPromises[userId]) {
      this.cachedPolicyPromises[userId] = this.buildAccessPolicy(userId);
    }
    return this.cachedPolicyPromises[userId];
  }

  async buildAccessPolicy(userId) {
    const userEntityPermissions = await this.models.userEntityPermission.find({ user_id: userId });
    const permissionGroupToChildren = {};
    const permissionGroupsByEntityCode = {};
    await Promise.all(
      userEntityPermissions.map(async userEntityPermission => {
        const {
          permission_group_name: permissionGroupName,
          entity_code: entityCode,
        } = userEntityPermission;

        if (!permissionGroupsByEntityCode[entityCode]) {
          // use a set so permissionGroups that are added again through child relationships only appear once
          permissionGroupsByEntityCode[entityCode] = new Set();
        }

        // get all of the permission groups below this one in the hierarchy, as the user also has
        // implied access for them, so they'll also be added to the access policy (which has a simple,
        // flat structure, ignorant of the fact that permission groups exist in a hierarchy)
        if (!permissionGroupToChildren[permissionGroupName]) {
          const permissionGroup = await userEntityPermission.permissionGroup();
          const children = await permissionGroup.getChildTree();
          permissionGroupToChildren[permissionGroupName] = children.map(c => c.name);
        }
        const permissionGroupChildren = permissionGroupToChildren[permissionGroupName];
        const permissionGroupsWithAccess = [permissionGroupName, ...permissionGroupChildren];
        permissionGroupsWithAccess.forEach(p => permissionGroupsByEntityCode[entityCode].add(p));
      }),
    );

    // convert the sets of permission groups into arrays
    const policy = Object.entries(permissionGroupsByEntityCode).reduce(
      (current, [entityCode, permissionGroups]) => ({
        ...current,
        [entityCode]: [...permissionGroups],
      }),
      {},
    );
    return policy;
  }
}
