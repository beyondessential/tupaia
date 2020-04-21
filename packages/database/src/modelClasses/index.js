/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { CountryModel } from './Country';
import { DataElementDataGroupModel } from './DataElementDataGroup';
import { DataSourceModel } from './DataSource';
import { EntityModel } from './Entity';
import { MeditrakDeviceModel } from './MeditrakDevice';
import { OneTimeLoginModel } from './OneTimeLogin';
import { PermissionGroupModel } from './PermissionGroup';
import { RefreshTokenModel } from './RefreshToken';
import { UserEntityPermissionModel } from './UserEntityPermission';
import { UserModel } from './User';

// export all models to be used in constructing a ModelRegistry
export const modelClasses = {
  Country: CountryModel,
  DataElementDataGroup: DataElementDataGroupModel,
  DataSource: DataSourceModel,
  Entity: EntityModel,
  MeditrakDevice: MeditrakDeviceModel,
  OneTimeLogin: OneTimeLoginModel,
  PermissionGroup: PermissionGroupModel,
  RefreshToken: RefreshTokenModel,
  User: UserModel,
  UserEntityPermission: UserEntityPermissionModel,
};

// export any models and types that are extended in other packages
export { UserEntityPermissionModel } from './UserEntityPermission';
