/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { DataElementsPage as BaseDataElementsPage } from '@tupaia/admin-panel';
import {
  DataSourceConfigView,
  getDataElementFieldEditConfig,
  SERVICE_TYPE_OPTIONS,
} from '../../common';
import { getDeleteConfigs } from '../helpers/getDeleteConfigs';
import { getImportConfigs } from '../helpers/getImportConfigs';
import { getColumnFilter } from '../../table/columnTypes/getColumnFilter';
import { getDeleteColumnConfigs } from '../helpers/getDeleteColumnConfigs';
import { getEditorConfigs, getCreateConfigs } from '../helpers';

const getButtonsConfig = (fields, recordType, translate) => [
  {
    Header: translate('admin.edit'),
    type: 'edit',
    source: 'id',
    actionConfig: {
      title: translate('admin.edit'),
      editEndpoint: `${recordType}s`,
      fields,
      displayUsedBy: true,
      recordType,
    },
  },
  getDeleteColumnConfigs(`${recordType}s`, translate),
];

const getDataElementFields = translate => {
  const DATA_ELEMENT_FIELD_EDIT_CONFIG = getDataElementFieldEditConfig(translate);
  const columnFilter = getColumnFilter(translate);

  return [
    {
      Header: translate('admin.code'),
      source: 'code',
      Filter: columnFilter,
    },
    {
      Header: translate('admin.dataService'),
      source: 'service_type',
      Filter: columnFilter,
      editConfig: { default: 'dhis', options: SERVICE_TYPE_OPTIONS },
    },
    {
      Header: translate('admin.dataServiceConfiguration'),
      source: 'config',
      Filter: columnFilter,
      Cell: DataSourceConfigView,
      editConfig: DATA_ELEMENT_FIELD_EDIT_CONFIG,
    },
    {
      Header: translate('admin.permissionGroups'),
      source: 'permission_groups',
      Filter: columnFilter,
      editConfig: {
        type: 'jsonArray',
      },
    },
  ];
};

export const DataElementsPage = ({ translate }) => {
  const DATA_ELEMENT_FIELDS = getDataElementFields(translate);
  const importConfig = getImportConfigs(translate, {
    actionConfig: {
      importEndpoint: 'dataElements',
    },
  });

  const editorConfig = getEditorConfigs(translate);
  const deleteConfig = getDeleteConfigs(translate);
  const createConfig = getCreateConfigs(translate, {
    actionConfig: {
      editEndpoint: 'dataElements',
      fields: DATA_ELEMENT_FIELDS,
    },
  });

  return (
    <BaseDataElementsPage
      title={translate('admin.dataElements')}
      endpoint="dataElements"
      reduxId="dataElements"
      columns={[
        ...DATA_ELEMENT_FIELDS,
        ...getButtonsConfig(DATA_ELEMENT_FIELDS, 'dataElement', translate),
      ]}
      importConfig={importConfig}
      createConfig={createConfig}
      editorConfig={editorConfig}
      deleteConfig={deleteConfig}
    />
  );
};

DataElementsPage.propTypes = {
  translate: PropTypes.func.isRequired,
};
