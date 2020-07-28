/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { PermissionGroupModel as CommonPermissionGroupModel } from '@tupaia/database';

export class PermissionGroupModel extends CommonPermissionGroupModel {
  meditrakConfig = {
    minAppVersion: '1.7.86',
  };
}
