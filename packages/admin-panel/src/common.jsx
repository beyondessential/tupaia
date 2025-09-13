import React from 'react';

export const SERVICE_TYPE_OPTIONS = [
  {
    label: 'Data Lake',
    value: 'data-lake',
  },
  {
    label: 'DHIS',
    value: 'dhis',
  },
  {
    label: 'Indicator',
    value: 'indicator',
  },
  {
    label: 'Kobo',
    value: 'kobo',
  },
  {
    label: 'Superset',
    value: 'superset',
  },
  {
    label: 'Tupaia',
    value: 'tupaia',
  },
  {
    label: 'Weather',
    value: 'weather',
  },
];

export const DATA_ELEMENT_FIELD_EDIT_CONFIG = {
  type: 'json',
  default: '{}',
  visibilityCriteria: {
    service_type: values => ['dhis', 'superset'].includes(values.service_type),
  },
  getJsonFieldSchema: () => [
    {
      label: 'DHIS Server',
      fieldName: 'dhisInstanceCode',
      optionsEndpoint: 'dhisInstances',
      optionLabelKey: 'dhisInstances.code',
      optionValueKey: 'dhisInstances.code',
      required: true,
      visibilityCriteria: { service_type: 'dhis' },
    },
    {
      label: 'Data element code',
      fieldName: 'dataElementCode',
      visibilityCriteria: { service_type: 'dhis' },
    },
    {
      label: 'Category option combo code',
      fieldName: 'categoryOptionCombo',
      visibilityCriteria: { service_type: 'dhis' },
    },
    {
      label: 'Superset Instance',
      fieldName: 'supersetInstanceCode',
      required: true,
      visibilityCriteria: { service_type: 'superset' },
    },
    {
      label: 'Superset Chart ID',
      fieldName: 'supersetChartId',
      required: true,
      visibilityCriteria: { service_type: 'superset' },
    },
    {
      label: 'Superset Item Code (optional)',
      fieldName: 'supersetItemCode',
      visibilityCriteria: { service_type: 'superset' },
    },
  ],
};

export const DataSourceConfigView = row => {
  const localStyles = {
    config: {
      dt: {
        float: 'left',
        clear: 'left',
        width: '175px',
        textAlign: 'right',
        marginRight: '5px',
      },
    },
  };

  const entries = Object.entries(row.value)
    .filter(([, value]) => value !== '')
    .map(([key, value]) => (
      <React.Fragment key={key}>
        <dt style={localStyles.config.dt}>{key}:</dt>
        <dd>{value ? value.toString() : '""'}</dd>
      </React.Fragment>
    ));

  return <dl>{entries}</dl>;
};

export const DATA_SOURCE_FIELDS = [
  {
    Header: 'Code',
    source: 'code',
    required: true,
  },
  {
    Header: 'Data service',
    source: 'service_type',
    required: true,
    editConfig: { default: 'dhis', options: SERVICE_TYPE_OPTIONS },
  },
];

export const getDataSourceButtonsConfig = (fields, recordType) => [
  {
    Header: 'Edit',
    type: 'edit',
    actionConfig: {
      editEndpoint: `${recordType}s`,
      fields,
      displayUsedBy: true,
      recordType,
    },
    source: 'id',
  },
  {
    Header: 'Delete',
    type: 'delete',
    actionConfig: {
      endpoint: `${recordType}s`,
    },
  },
];

export const DATA_ELEMENT_FIELDS = [
  ...DATA_SOURCE_FIELDS,
  {
    Header: 'Data service configuration',
    source: 'config',
    Cell: DataSourceConfigView,
    editConfig: DATA_ELEMENT_FIELD_EDIT_CONFIG,
  },
  {
    Header: 'Permission groups',
    source: 'permission_groups',
    required: true,
    editConfig: {
      optionsEndpoint: 'permissionGroups',
      optionLabelKey: 'name',
      optionValueKey: 'name',
      sourceKey: 'permission_groups',
      allowMultipleValues: true,
    },
  },
];
