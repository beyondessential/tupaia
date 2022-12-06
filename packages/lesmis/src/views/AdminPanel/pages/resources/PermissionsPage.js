/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { PermissionsPage as BasePermissionsPage } from '@tupaia/admin-panel';
import {
  getBaseEditorConfigs,
  getCreateConfigs,
  getDeleteConfigs,
  getImportConfigs,
} from '../helpers';
import { getColumnFilter } from '../../table/columnTypes';
import { getDeleteColumnConfigs } from '../helpers/getDeleteColumnConfigs';

// export for use on users page
export const PERMISSIONS_ENDPOINT = 'userEntityPermissions';

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

export const PermissionsPage = ({ getHeaderEl, translate }) => {
  const PERMISSIONS_COLUMNS = [
    {
      Header: translate('admin.entity'),
      source: 'entity.name',
      editConfig: {
        optionsEndpoint: 'entities',
        baseFilter: { type: 'country' },
      },
      Filter: getColumnFilter(translate),
    },
    {
      Header: translate('admin.permissionGroup'),
      source: 'permission_group.name',
      editConfig: {
        optionsEndpoint: 'permissionGroups',
      },
      Filter: getColumnFilter(translate),
    },
  ];

  const FIELDS = [
    {
      Header: translate('admin.user'),
      source: 'user.first_name',
      accessor: rowData => `${rowData['user.first_name']} ${rowData['user.last_name']}`,
      editable: false,
      Filter: getColumnFilter(translate),
    },
    {
      Header: translate('admin.emailAddress'),
      source: 'user.email',
      editable: false,
      Filter: getColumnFilter(translate),
    },
    {
      source: 'user.last_name',
      show: false,
    },
    ...PERMISSIONS_COLUMNS,
    {
      Header: translate('admin.edit'),
      source: 'id',
      type: 'edit',
      actionConfig: {
        title: translate('admin.edit'),
        editEndpoint: PERMISSIONS_ENDPOINT,
        fields: PERMISSIONS_COLUMNS,
      },
    },
    getDeleteColumnConfigs(PERMISSIONS_ENDPOINT, translate),
  ];

  const editorConfig = getBaseEditorConfigs(translate);
  const createConfig = getCreateConfigs(translate, {
    bulkCreate: true,
    actionConfig: {
      bulkUpdateEndpoint: PERMISSIONS_ENDPOINT,
      fields: [
        {
          Header: translate('admin.emailAddress'),
          source: 'user.email',
          editConfig: {
            optionsEndpoint: 'users',
            optionLabelKey: 'email',
            allowMultipleValues: true,
          },
        },
        {
          Header: translate('admin.entity'),
          source: 'entity.name',
          editConfig: {
            optionsEndpoint: 'entities',
            baseFilter: { type: 'country' },
            allowMultipleValues: true,
          },
        },
        {
          Header: translate('admin.permissionGroup'),
          source: 'permission_group.name',
          editConfig: {
            optionsEndpoint: 'permissionGroups',
            allowMultipleValues: true,
          },
        },
      ],
    },
  });
  const deleteConfig = getDeleteConfigs(translate);
  const importConfig = getImportConfigs(translate, {
    actionConfig: {
      importEndpoint: 'userPermissions',
    },
  });

  return (
    <BasePermissionsPage
      title={translate('admin.permissions')}
      endpoint={PERMISSIONS_ENDPOINT}
      columns={FIELDS}
      createConfig={createConfig}
      editorConfig={editorConfig}
      importConfig={importConfig}
      deleteConfig={deleteConfig}
      getHeaderEl={getHeaderEl}
      onProcessDataForSave={processDataForSave}
    />
  );
};

PermissionsPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired,
};
