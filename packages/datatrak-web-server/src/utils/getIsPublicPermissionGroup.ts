/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { PermissionGroup } from '@tupaia/types';

const PUBLIC_PERMISSION_GROUP_NAME = 'Public';
export const getIsPublicPermissionGroup = (name: PermissionGroup['name']) => {
  return name === PUBLIC_PERMISSION_GROUP_NAME;
};
