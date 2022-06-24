/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { PermissionsPage } from '@tupaia/admin-panel';
import { LESMIS_PERMISSION_GROUPS } from '../../constants';

const PERMISSIONS_ENDPOINT = 'userEntityPermissions';

const CREATE_CONFIG = {
  title: 'Give User Permission',
  actionConfig: {
    editEndpoint: PERMISSIONS_ENDPOINT,
    fields: [
      {
        Header: 'User Email',
        source: 'user.email',
        editConfig: {
          optionsEndpoint: 'users',
          optionLabelKey: 'email',
          baseFilter: { primary_platform: 'lesmis' },
        },
      },
      {
        Header: 'Entity',
        source: 'entity.name',
        editConfig: {
          optionsEndpoint: 'entities',
          baseFilter: { type: 'country' },
        },
      },
      {
        Header: 'Permission Group',
        source: 'permission_group.name',
        editConfig: {
          optionsEndpoint: 'permissionGroups',
        },
      },
    ],
  },
};

export const PermissionsView = props => (
  <PermissionsPage
    {...props}
    baseFilter={{
      'permission_group.name': {
        comparator: 'in',
        comparisonValue: Object.values(LESMIS_PERMISSION_GROUPS),
      },
    }}
    createConfig={CREATE_CONFIG}
    importConfig={null}
    LinksComponent={null}
  />
);
