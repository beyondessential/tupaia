import {
  UserEntityPermissionModel as BaseUserEntityPermissionModel,
  UserEntityPermissionRecord as BaseUserEntityPermissionRecord,
} from '@tupaia/database';
import { Entity, PermissionGroup, UserEntityPermission } from '@tupaia/types';
import { Model } from './types';

export interface UserEntityPermissionRecord
  extends UserEntityPermission,
    BaseUserEntityPermissionRecord {
  entity_code?: Entity['code'];
  permission_group_name?: PermissionGroup['name'];
}

export interface UserEntityPermissionModel
  extends Model<BaseUserEntityPermissionModel, UserEntityPermission, UserEntityPermissionRecord> {}
