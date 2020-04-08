/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { ResourcePage } from './ResourcePage';
import { ENTITIES_COLUMNS } from './EntitiesPage';

const FIELDS = [
  {
    Header: 'Name',
    source: 'name',
  },
  {
    Header: 'Code',
    source: 'code',
  },
];

const COLUMNS = [
  ...FIELDS,
  {
    Header: 'Export Survey Responses',
    source: 'id',
    type: 'filteredExport',
    width: 200,
    actionConfig: {
      filter: { endpoint: 'surveys', _raw_: '[id] = ANY(country_ids)' },
      export: { endpoint: 'surveyResponses' },
      //queryParameter: 'countryId',
      fileName: '{name} Survey Responses',
    },
  },
];

const EXPANSION_CONFIG = [
  {
    title: 'Entities',
    endpoint: 'entities',
    columns: ENTITIES_COLUMNS,
    joinFrom: 'code',
    joinTo: 'code',
  },
];

const CREATE_CONFIG = {
  title: 'New Country',
  actionConfig: {
    editEndpoint: 'country',
    fields: FIELDS,
  },
};

const FILTERED_EXPORT_CONFIG = {
  title: 'Export Survey Responses',
  actionConfig: {
    importEndpoint: 'surveys',
  },
  queryParameters: [
    {
      label: 'Surveys',
      instruction: 'Select the surveys to get the exported responses.',
      parameterKey: 'surveyNames',
      optionsEndpoint: 'surveys',
      optionValueKey: 'name',
      allowMultipleValues: true,
      canCreateNewOptions: false,
    },
  ],
};

export const CountriesPage = () => (
  <ResourcePage
    title="Countries"
    endpoint="countries"
    columns={COLUMNS}
    expansionTabs={EXPANSION_CONFIG}
    createConfig={CREATE_CONFIG}
    filteredExportConfig={FILTERED_EXPORT_CONFIG}
  />
);
