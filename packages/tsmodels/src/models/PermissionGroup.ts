import {
  PermissionGroupModel as BasePermissionGroupModel,
  PermissionGroupRecord as BasePermissionGroupRecord,
} from '@tupaia/database';
import { PermissionGroup } from '@tupaia/types';
import { Model } from './types';

export interface PermissionGroupRecord extends PermissionGroup, BasePermissionGroupRecord {}

export interface PermissionGroupModel
  extends Model<BasePermissionGroupModel, PermissionGroup, PermissionGroupRecord> {}
