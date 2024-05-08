/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Tooltip as TooltipComponent } from '@tupaia/ui-components';
import { users } from '@tupaia/admin-panel';
import { getColumnFilter, getVerifiedFilter } from '../../table/columnTypes';
import { getBaseEditorConfigs, getCreateConfigs, getImportConfigs } from '../helpers';

export const getUsersPageConfig = translate => {
  // eslint-disable-next-line react/prop-types
  const VerifiedCell = ({ value }) => {
    if (value === 'verified') {
      return translate('admin.yes');
    }
    if (value === 'new_user') {
      return translate('admin.no');
    }
    return (
      <TooltipComponent title="Historical user which does not need verification">
        <div>Not Applicable</div>
      </TooltipComponent>
    );
  };

  const FIELDS = [
    {
      Header: translate('admin.emailAddress'),
      source: 'email',
      type: 'tooltip',
      Filter: getColumnFilter(translate),
    },
    {
      Header: translate('admin.phoneNumber'),
      source: 'mobile_number',
      Filter: getColumnFilter(translate),
    },
    {
      Header: translate('admin.position'),
      source: 'position',
      Filter: getColumnFilter(translate),
    },
    {
      Header: translate('admin.employer'),
      source: 'employer',
      type: 'tooltip',
      Filter: getColumnFilter(translate),
    },
  ];

  const EDIT_FIELDS = [
    {
      Header: translate('admin.firstName'),
      source: 'first_name',
    },
    {
      Header: translate('admin.lastName'),
      source: 'last_name',
    },
    ...FIELDS,
    {
      Header: translate('admin.verified'),
      source: 'verified_email',
      type: 'tooltip',
      editConfig: {
        options: [
          {
            label: translate('admin.no'),
            value: 'new_user',
          },
          {
            label: translate('admin.yes'),
            value: 'verified',
          },
        ],
      },
    },
    {
      Header: translate('admin.password'),
      source: 'password',
      hideValue: true,
    },
  ];

  const COLUMNS = [
    {
      Header: translate('admin.firstName'),
      source: 'first_name',
      width: 150,
      Filter: getColumnFilter(translate),
    },
    {
      Header: translate('admin.lastName'),
      source: 'last_name',
      width: 150,
      Filter: getColumnFilter(translate),
    },
    ...FIELDS,
    {
      Header: translate('admin.verified'),
      source: 'verified_email',
      Cell: VerifiedCell,
      Filter: getVerifiedFilter(translate),
    },
    {
      Header: translate('admin.edit'),
      source: 'id',
      type: 'edit',
      width: 150,
      actionConfig: {
        title: translate('admin.edit'),
        editEndpoint: 'users',
        fields: EDIT_FIELDS,
      },
    },
  ];

  const PERMISSIONS_COLUMNS = [
    {
      Header: translate('admin.entity'),
      source: 'entity.name',
      editConfig: {
        optionsEndpoint: 'entities',
        baseFilter: { type: 'country' },
      },
    },
    {
      Header: translate('admin.permissionGroup'),
      source: 'permission_group.name',
      editConfig: {
        optionsEndpoint: 'permissionGroups',
      },
    },
  ];

  const editorConfig = getBaseEditorConfigs(translate);
  const importConfig = getImportConfigs(translate, {
    actionConfig: {
      importEndpoint: 'users',
    },
  });
  const createConfig = getCreateConfigs(translate, {
    actionConfig: {
      editEndpoint: 'users',
      fields: [
        ...EDIT_FIELDS,
        {
          Header: 'Api Client (Not required for most users, see Readme of admin-panel for usage)',
          source: 'is_api_client',
          type: 'boolean',
          editConfig: {
            type: 'boolean',
          },
        },
      ],
    },
  });

  return {
    ...users,
    title: translate('admin.users'),
    columns: COLUMNS,
    editorConfig,
    importConfig,
    createConfig,
    nestedView: {
      ...users.nestedView,
      title: translate('admin.permissions'),
      columns: PERMISSIONS_COLUMNS,
    },
  };
};
