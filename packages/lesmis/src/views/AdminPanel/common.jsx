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

export const getDataElementFieldEditConfig = translate => ({
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
      visibilityCriteria: { service_type: 'dhis' },
    },
    {
      label: translate('admin.dataElementCode'),
      fieldName: 'dataElementCode',
      visibilityCriteria: { service_type: 'dhis' },
    },
    {
      label: translate('admin.categoryOptionComboCode'),
      fieldName: 'categoryOptionCombo',
      visibilityCriteria: { service_type: 'dhis' },
    },
  ],
});

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

  const blankString = '';
  const entries = Object.entries(row.value)
    .filter(([, value]) => value !== blankString)
    .map(([key, value]) => (
      <React.Fragment key={key}>
        <dt style={localStyles.config.dt}>{key}:</dt>
        <dd>{value ? value.toString() : '""'}</dd>
      </React.Fragment>
    ));

  return <dl>{entries}</dl>;
};
