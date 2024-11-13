/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { getPluralForm } from '../../pages/resources/resourceName';

const RESOURCE_NAME = { singular: 'permission' };

const EntityField = {
  Header: 'Entity',
  source: 'entity.name',
  required: true,
  editConfig: {
    optionsEndpoint: 'entities',
    type: 'checkboxList',
    baseFilter: { type: 'country' },
    optionLabelKey: 'entity.name',
    optionValueKey: 'entity.id',
    allowMultipleValues: true,
    labelTooltip: 'Select the countries for which this permission applies',
    pageSize: 'ALL',
    sourceKey: 'entity_id',
  },
};
export const PERMISSIONS_ENDPOINT = 'userEntityPermissions';
export const PERMISSIONS_COLUMNS = [
  {
    Header: 'Entity',
    source: 'entity.name',
    required: true,
    editConfig: {
      optionsEndpoint: 'entities',
      baseFilter: { type: 'country' },
    },
  },
  {
    Header: 'Permission group',
    source: 'permission_group.name',
    required: true,
    editConfig: {
      optionsEndpoint: 'permissionGroups',
    },
  },
];

const FIELDS = [
  {
    Header: 'First name',
    source: 'user.first_name',
    editable: false,
  },
  {
    Header: 'Last name',
    source: 'user.last_name',
    editable: false,
  },
  {
    Header: 'Email address',
    source: 'user.email',
    editable: false,
  },
  ...PERMISSIONS_COLUMNS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      title: 'Edit user’s permission',
      editEndpoint: PERMISSIONS_ENDPOINT,
      fields: PERMISSIONS_COLUMNS,
    },
  },
  {
    Header: 'Delete',
    type: 'delete',
    actionConfig: {
      endpoint: PERMISSIONS_ENDPOINT,
    },
  },
];

const CREATE_CONFIG = {
  bulkCreate: true,
  actionConfig: {
    title: `Give user ${RESOURCE_NAME.singular}`,
    bulkUpdateEndpoint: PERMISSIONS_ENDPOINT,
    fields: [
      {
        Header: 'User email',
        source: 'user.email',
        required: true,
        editConfig: {
          optionsEndpoint: 'users',
          optionLabelKey: 'email',
          allowMultipleValues: true,
        },
      },
      EntityField,
      {
        Header: 'Permission group',
        source: 'permission_group.name',
        required: true,
        editConfig: {
          optionsEndpoint: 'permissionGroups',
          allowMultipleValues: true,
        },
      },
    ],
  },
};

const IMPORT_CONFIG = {
  title: `Import user ${getPluralForm(RESOURCE_NAME)}`,
  actionConfig: {
    importEndpoint: 'userPermissions',
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
  },
};

// When creating, return an array of records for bulk editing on the server
// When editing, just process a single record as normal
const onProcessDataForSave = (fieldsToSave, recordData) => {
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

export const permissions = {
  resourceName: RESOURCE_NAME,
  path: '/permissions',
  endpoint: PERMISSIONS_ENDPOINT,
  columns: FIELDS,
  importConfig: IMPORT_CONFIG,
  createConfig: CREATE_CONFIG,
  onProcessDataForSave,
};
