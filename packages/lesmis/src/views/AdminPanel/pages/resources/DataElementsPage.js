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
import { getEditorConfigs } from '../helpers/getEditorConfigs';
import { getImportModalText } from '../helpers/getImportModalText';
import { getColumnFilter } from '../../table/columnTypes/getColumnFilter';

const getButtonsConfig = (fields, recordType, translate) => [
  {
    Header: translate('admin.edit'),
    type: 'edit',
    source: 'id',
    actionConfig: {
      editEndpoint: `${recordType}s`,
      fields,
      displayUsedBy: true,
      recordType,
    },
  },
  {
    Header: translate('admin.delete'),
    source: 'id',
    type: 'delete',
    actionConfig: {
      endpoint: `${recordType}s`,
    },
  },
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

export const DataElementsPage = ({ getHeaderEl, translate }) => {
  const DATA_ELEMENT_FIELDS = getDataElementFields(translate);
  const importModalText = getImportModalText(translate);
  const IMPORT_CONFIG = {
    title: translate('admin.import'),
    actionConfig: {
      importEndpoint: 'dataElements',
    },
    ...importModalText,
  };
  const EDITOR_CONFIG = getEditorConfigs(translate);

  return (
    <BaseDataElementsPage
      title={translate('admin.dataElements')}
      endpoint="dataElements"
      reduxId="dataElements"
      columns={[
        ...DATA_ELEMENT_FIELDS,
        ...getButtonsConfig(DATA_ELEMENT_FIELDS, 'dataElement', translate),
      ]}
      importConfig={IMPORT_CONFIG}
      createConfig={{
        label: translate('admin.new'),
        actionConfig: {
          title: translate('admin.createNew'),
          editEndpoint: 'dataElements',
          fields: [...DATA_ELEMENT_FIELDS],
        },
      }}
      getHeaderEl={getHeaderEl}
      editorConfig={EDITOR_CONFIG}
    />
  );
};

DataElementsPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired,
};
