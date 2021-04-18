/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { AccessPolicy } from '@tupaia/access-policy';
import { PermissionsError } from '@tupaia/utils';
import { LESMIS_COUNTRY_ENTITY_CODE, LESMIS_PERMISSION_GROUP } from '../constants';

export const verifyLoginAccess = (accessPolicy: any) => {
  const hasAccess = new AccessPolicy(accessPolicy).allows(
    LESMIS_COUNTRY_ENTITY_CODE,
    LESMIS_PERMISSION_GROUP,
  );
  if (!hasAccess) {
    throw new PermissionsError('Your permissions for Tupaia do not allow you to login to LESMIS');
  }

  return hasAccess;
};
