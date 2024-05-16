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
    Header: 'Permission Group',
    source: 'permission_group.name',
    required: true,
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
    type: 'edit',
    source: 'id',
    actionConfig: {
      title: "Edit User's Permission",
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
  title: 'Give User Permission',
  bulkCreate: true,
  actionConfig: {
    bulkUpdateEndpoint: PERMISSIONS_ENDPOINT,
    fields: [
      {
        Header: 'User Email',
        source: 'user.email',
        required: true,
        editConfig: {
          optionsEndpoint: 'users',
          optionLabelKey: 'email',
          allowMultipleValues: true,
        },
      },
      {
        Header: 'Entity',
        source: 'entity.name',
        required: true,
        editConfig: {
          optionsEndpoint: 'entities',
          optionLabelKey: 'name',
          baseFilter: { type: 'country' },
          allowMultipleValues: true,
        },
      },
      {
        Header: 'Permission Group',
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
  title: 'Import User Permissions',
  actionConfig: {
    importEndpoint: 'userPermissions',
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
  title: 'Permissions',
  path: '/permissions',
  endpoint: PERMISSIONS_ENDPOINT,
  columns: FIELDS,
  importConfig: IMPORT_CONFIG,
  createConfig: CREATE_CONFIG,
  onProcessDataForSave,
};
