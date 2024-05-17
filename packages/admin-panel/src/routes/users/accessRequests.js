/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

export const ACCESS_REQUESTS_ENDPOINT = 'accessRequests';

const USER_FIELDS = [
  {
    Header: 'Email Address',
    source: 'user_account.email',
    type: 'tooltip',
  },
  {
    Header: 'First Name',
    source: 'user.first_name',
  },
  {
    Header: 'Last Name',
    source: 'user.last_name',
  },
  {
    Header: 'Employer',
    source: 'user.employer',
  },
  {
    Header: 'Phone',
    source: 'user.mobile_number',
  },
  {
    Header: 'Approved',
    source: 'approved',
    show: false,
  },
];

const ACCESS_REQUEST_FIELDS = [
  {
    Header: 'Entity',
    source: 'entity.name',
    editConfig: { optionsEndpoint: 'entities', baseFilter: { type: 'country' } },
  },
  {
    Header: 'Project Code',
    source: 'project.code',
    editable: false,
  },
  {
    Header: 'Message',
    source: 'message',
    type: 'tooltip',
    editable: false,
  },
  {
    Header: 'Note',
    source: 'note',
    editConfig: { type: 'textarea' },
  },
  {
    Header: 'Permission Group',
    source: 'permission_group.name',
    required: true,
    editConfig: {
      optionsEndpoint: 'permissionGroups',
      secondaryLabel:
        'If a default is shown here, it will give the user access to the project they requested, but please review carefully as some projects have several permission levels.',
    },
  },
];

const USER_COLUMNS = [
  ...USER_FIELDS,
  {
    Header: 'Edit',
    type: 'bulkEdit',
    source: 'user_id',
    width: 150,
    actionConfig: {
      title: 'Edit & Approve Access Requests',
      bulkGetEndpoint: `users/{user_id}/${ACCESS_REQUESTS_ENDPOINT}`,
      bulkUpdateEndpoint: `${ACCESS_REQUESTS_ENDPOINT}`,
      baseFilter: { approved: null },
      fields: [
        {
          Header: 'Entity',
          source: 'entity.name',
          bulkAccessor: rows => rows.map(row => row['entity.name'] ?? 'blank').join(', '),
          editable: false,
        },
        {
          Header: 'Project Code',
          source: 'project.code',
          bulkAccessor: rows => rows.map(row => row['project.code'] ?? 'blank').join(', '),
          editable: false,
        },
        {
          Header: 'Message',
          source: 'message',
          bulkAccessor: rows => rows.map(row => (row.message ? row.message : 'blank')).join(', '),
          type: 'tooltip',
          editable: false,
        },
        {
          Header: 'id',
          source: 'id',
          show: false,
        },
        {
          Header: 'Permission Group',
          source: 'permission_group.name',
          required: true,
          editConfig: {
            optionsEndpoint: 'permissionGroups',
            secondaryLabel:
              'If a default is shown here, it will give the user access to the project they requested, but please review carefully as some projects have several permission levels.',
          },
        },
        {
          Header: 'Approved',
          source: 'approved',
          type: 'boolean',
          alwaysValidate: true,
          required: true,
          editConfig: {
            type: 'boolean',
          },
        },
        {
          Header: 'Note',
          source: 'note',
          editConfig: { type: 'textarea' },
        },
      ],
    },
  },
];

const DETAILS_COLUMNS = [
  ...ACCESS_REQUEST_FIELDS,
  {
    Header: 'Approve/Decline',
    width: 140,
    source: 'id',
    type: 'edit',
    actionConfig: {
      title: 'Edit & Approve Access Request',
      editEndpoint: 'accessRequests',
      fields: [
        ...ACCESS_REQUEST_FIELDS,
        {
          Header: 'Approved',
          source: 'approved',
          required: true,
          alwaysValidate: true,
          type: 'boolean',
          editConfig: {
            type: 'boolean',
          },
        },
      ],
    },
  },
];

export const accessRequests = {
  title: 'Access requests',
  path: '/access-requests',
  endpoint: ACCESS_REQUESTS_ENDPOINT,
  columns: USER_COLUMNS,
  baseFilter: { approved: null },
  onProcessDataForSave: (editedFields, recordData) => {
    if (!Array.isArray(recordData)) {
      return editedFields;
    }

    // Return an array of records for bulk editing on the server
    return recordData.map(record => ({ ...record, ...editedFields }));
  },
  nestedView: {
    title: 'Access Requests',
    endpoint: `users/{user_id}/${ACCESS_REQUESTS_ENDPOINT}`,
    columns: DETAILS_COLUMNS,
    baseFilter: { approved: null },
    path: '/:user_id/access-requests',
    getDisplayValue: user => {
      if (!user) return '';
      return `${user['user.first_name']} ${user['user.last_name']}`;
    },
  },
};
