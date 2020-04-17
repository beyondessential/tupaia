/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { CountryModel as Country } from './Country';
import { DataElementDataGroupModel as DataElementDataGroup } from './DataElementDataGroup';
import { DataSourceModel as DataSource } from './DataSource';
import { EntityModel as Entity } from './Entity';
import { MeditrakDeviceModel as MeditrakDevice } from './MeditrakDevice';
import { OneTimeLoginModel as OneTimeLogin } from './OneTimeLogin';
import { PermissionGroupModel as PermissionGroup } from './PermissionGroup';
import { RefreshTokenModel as RefreshToken } from './RefreshToken';
import { UserEntityPermissionModel as UserEntityPermission } from './UserEntityPermission';
import { UserModel as User } from './User';

export const modelClasses = {
  Country,
  DataElementDataGroup,
  DataSource,
  Entity,
  MeditrakDevice,
  OneTimeLogin,
  PermissionGroup,
  RefreshToken,
  User,
  UserEntityPermission,
};
