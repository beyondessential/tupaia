import { KeyValueCellBuilder } from '../KeyValueCellBuilder';

export class UserConfigCellBuilder extends KeyValueCellBuilder {
  extractRelevantObject({ user }) {
    return user;
  }

  async fetchPermissionGroupName(permissionGroupId) {
    const permissionGroup = await this.models.permissionGroup.findById(permissionGroupId);
    if (!permissionGroup) return '';
    return permissionGroup.name;
  }

  async build(jsonStringOrObject) {
    if (!jsonStringOrObject) {
      return '';
    }

    const fullObject =
      typeof jsonStringOrObject === 'string' ? JSON.parse(jsonStringOrObject) : jsonStringOrObject;
    const userObject = this.extractRelevantObject(fullObject);
    if (!userObject) return '';

    const { permissionGroup } = userObject;
    if (!permissionGroup) return '';

    const permissionGroupName = await this.fetchPermissionGroupName(permissionGroup);

    return `permissionGroup: ${permissionGroupName}`;
  }
}
