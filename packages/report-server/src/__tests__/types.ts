/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import {
  ModelRegistry,
  EntityModel,
  UserModel,
  ReportModel,
  DataElementModel,
  PermissionGroupModel,
  DataGroupModel,
  DataElementDataGroupModel,
} from '@tupaia/database';

export interface TestModelRegistry extends ModelRegistry {
  readonly entity: EntityModel;
  readonly user: UserModel;
  readonly report: ReportModel;
  readonly dataElement: DataElementModel;
  readonly permissionGroup: PermissionGroupModel;
  readonly dataGroup: DataGroupModel;
  readonly dataElementDataGroup: DataElementDataGroupModel;
}
