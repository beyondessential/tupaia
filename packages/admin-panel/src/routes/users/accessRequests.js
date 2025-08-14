export const ACCESS_REQUESTS_ENDPOINT = 'accessRequests';

const RESOURCE_NAME = { singular: 'access request' };

const USER_FIELDS = [
  {
    Header: 'Email address',
    source: 'user_account.email',
  },
  {
    Header: 'First name',
    source: 'user.first_name',
  },
  {
    Header: 'Last name',
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
    Header: 'Project code',
    source: 'project.code',
    editable: false,
  },
  {
    Header: 'Message',
    source: 'message',
    editable: false,
  },
  {
    Header: 'Note',
    source: 'note',
    editConfig: { type: 'textarea' },
  },
  {
    Header: 'Permission group',
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
    actionConfig: {
      title: 'Edit & approve access requests',
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
          Header: 'Project code',
          source: 'project.code',
          bulkAccessor: rows => rows.map(row => row['project.code'] ?? 'blank').join(', '),
          editable: false,
        },
        {
          Header: 'Message',
          source: 'message',
          bulkAccessor: rows => rows.map(row => (row.message ? row.message : 'blank')).join(', '),
          editable: false,
        },
        {
          Header: 'id',
          source: 'id',
          show: false,
        },
        {
          Header: 'Permission group',
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
    Header: 'Approve/decline',
    source: 'id',
    type: 'edit',
    actionConfig: {
      title: 'Edit & approve access request',
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
  resourceName: RESOURCE_NAME,
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
  nestedViews: [
    {
      resourceName: RESOURCE_NAME,
      endpoint: `users/{user_id}/${ACCESS_REQUESTS_ENDPOINT}`,
      columns: DETAILS_COLUMNS,
      baseFilter: { approved: null },
      path: '/:user_id/access-requests',
      getDisplayValue: user => {
        if (!user) return '';
        return `${user['user.first_name']} ${user['user.last_name']}`;
      },
    },
  ],
};
