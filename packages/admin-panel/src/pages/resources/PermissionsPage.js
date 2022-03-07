/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ResourcePage } from './ResourcePage';

// export for use on users page
export const PERMISSIONS_ENDPOINT = 'userEntityPermissions';
export const PERMISSIONS_COLUMNS = [
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
];

const FIELDS = [
  {
    Header: 'User',
    source: 'user.first_name',
    accessor: rowData => `${rowData['user.first_name']} ${rowData['user.last_name']}`,
    editable: false,
  },
  {
    Header: 'Email',
    source: 'user.email',
    editable: false,
  },
  {
    source: 'user.last_name',
    show: false,
  },
  ...PERMISSIONS_COLUMNS,
  {
    Header: 'Edit',
    source: 'id',
    type: 'edit',
    actionConfig: {
      editEndpoint: PERMISSIONS_ENDPOINT,
      fields: PERMISSIONS_COLUMNS,
    },
  },
  {
    Header: 'Delete',
    source: 'id',
    type: 'delete',
    actionConfig: {
      endpoint: PERMISSIONS_ENDPOINT,
    },
  },
];

const EDIT_CONFIG = {
  title: "Edit User's Permission",
};

const CREATE_CONFIG = {
  title: 'Give User Permission',
  bulkCreate: true,
  actionConfig: {
    bulkUpdateEndpoint: PERMISSIONS_ENDPOINT,
    fields: [
      {
        Header: 'User Email',
        source: 'user.email',
        editConfig: {
          optionsEndpoint: 'users',
          optionLabelKey: 'email',
          allowMultipleValues: true,
        },
      },
      {
        Header: 'Entity',
        source: 'entity.name',
        editConfig: {
          optionsEndpoint: 'entities',
          baseFilter: { type: 'country' },
          allowMultipleValues: true,
        },
      },
      {
        Header: 'Permission Group',
        source: 'permission_group.name',
        editConfig: {
          optionsEndpoint: 'permissionGroups',
          allowMultipleValues: true,
        },
      },
    ],
  },
};

// When creating, return an array of records for bulk editing on the server
// When editing, just process a single record as normal
const processDataForSave = (fieldsToSave, recordData) => {
  const isEditingSingle = Object.keys(recordData).length > 0;
  if (isEditingSingle) {
    return fieldsToSave;
  }

  // Creating new records in bulk
  const records = [];

  const getRecordValues = (partialRecord, values) => {
    const [firstKey] = Object.keys(values);
    const { [firstKey]: ids, ...remainingRows } = values;

    ids.forEach(id => {
      const record = {
        ...partialRecord,
        [firstKey]: id,
      };

      if (Object.entries(remainingRows).length > 0) {
        getRecordValues(record, remainingRows);
      } else {
        records.push(record);
      }
    });
  };

  getRecordValues({}, fieldsToSave);

  return records;
};

export const PermissionsPage = ({ getHeaderEl, ...props }) => (
  <ResourcePage
    title="Permissions"
    endpoint={PERMISSIONS_ENDPOINT}
    columns={FIELDS}
    editConfig={EDIT_CONFIG}
    createConfig={CREATE_CONFIG}
    getHeaderEl={getHeaderEl}
    {...props}
    onProcessDataForSave={processDataForSave}
  />
);

PermissionsPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
