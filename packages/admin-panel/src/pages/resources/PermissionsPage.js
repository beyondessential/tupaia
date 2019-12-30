/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';

import { ResourcePage } from './ResourcePage';
import { TabsPage } from '../TabsPage';

const COUNTRY = 'COUNTRY';
const GEOGRAPHICAL_AREA = 'GEOGRAPHICAL_AREA';
const FACILITY = 'FACILITY';

const TABS = {
  [COUNTRY]: {
    title: 'Country level',
    endpoint: 'userCountryPermissions',
    fields: [
      {
        Header: 'Country',
        source: 'country.name',
        editConfig: {
          optionsEndpoint: 'countries',
        },
      },
    ],
  },
  [GEOGRAPHICAL_AREA]: {
    title: 'Geographical Area level',
    endpoint: 'userGeographicalAreaPermissions',
    fields: [
      {
        Header: 'Geographical Area',
        source: 'geographical_area.name',
        editConfig: {
          optionsEndpoint: 'geographical_area',
        },
      },
    ],
  },
  [FACILITY]: {
    title: 'Facility level',
    endpoint: 'userFacilityPermissions',
    fields: [
      {
        // TODO: this has to moved over to entities
        Header: 'Facility',
        source: 'clinic.name',
        editConfig: {
          optionsEndpoint: 'facilities',
        },
      },
    ],
  },
};

const BASE_FIELDS = [
  {
    Header: 'Permission Group',
    source: 'permission_group.name',
    editConfig: {
      optionsEndpoint: 'permissionGroups',
    },
  },
];

const USER_FIELDS = [
  {
    Header: 'User',
    source: 'user.first_name',
    accessor: rowData => `${rowData['user.first_name']} ${rowData['user.last_name']}`,
    editable: false,
  },
  {
    source: 'user.last_name',
    show: false,
  },
];

export const getPermissionColumns = (fields, endpoint) => [
  ...BASE_FIELDS,
  ...fields,
  {
    Header: 'Edit',
    source: 'id',
    type: 'edit',
    actionConfig: {
      editEndpoint: endpoint,
      fields: [...USER_FIELDS, ...fields, ...BASE_FIELDS],
    },
  },
  {
    Header: 'Delete',
    source: 'id',
    type: 'delete',
    actionConfig: {
      endpoint,
    },
  },
];

const getPermissionColumnsForTab = tabName => {
  const { fields, endpoint } = TABS[tabName];
  return getPermissionColumns(fields, endpoint);
};

const EDIT_CONFIG = {
  title: "Edit User's Permission",
};

const getCreateConfig = (fields, editEndpoint) => ({
  title: 'Give User Permission',
  actionConfig: {
    editEndpoint,
    fields: [
      {
        Header: 'User Email',
        source: 'user.email',
        editConfig: {
          optionsEndpoint: 'users',
          optionLabelKey: 'email',
        },
      },
      ...BASE_FIELDS,
      ...fields,
    ],
  },
});

const getTabPage = tabName => {
  const { title, endpoint, fields } = TABS[tabName];
  if (!TABS[tabName]) {
    console.warn(`No tab with name '${tabName}' found.`);
  }

  return {
    title,
    component: (
      <ResourcePage
        title={title}
        endpoint={endpoint}
        columns={[...USER_FIELDS, ...getPermissionColumns(fields, endpoint)]}
        editConfig={EDIT_CONFIG}
        createConfig={getCreateConfig(fields, endpoint)}
      />
    ),
  };
};

export const PermissionsPage = () => (
  <TabsPage tabs={[getTabPage(COUNTRY), getTabPage(GEOGRAPHICAL_AREA), getTabPage(FACILITY)]} />
);

// For UsersPage expansion.
export const COUNTRY_PERMISSION_COLUMNS = getPermissionColumnsForTab(COUNTRY);
export const GEOGRAPHICAL_AREA_PERMISSION_COLUMNS = getPermissionColumnsForTab(GEOGRAPHICAL_AREA);
export const FACILITY_PERMISSION_COLUMNS = getPermissionColumnsForTab(FACILITY);
