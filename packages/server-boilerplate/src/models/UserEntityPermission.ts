/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import {
  UserEntityPermissionModel as BaseUserEntityPermissionModel,
  UserEntityPermissionRecord as BaseUserEntityPermissionRecord,
} from '@tupaia/database';
import { UserEntityPermission } from '@tupaia/types';
import { Model } from './types';

export interface UserEntityPermissionRecord
  extends UserEntityPermission,
    BaseUserEntityPermissionRecord {}

export interface UserEntityPermissionModel
  extends Model<BaseUserEntityPermissionModel, UserEntityPermission, UserEntityPermissionRecord> {}
