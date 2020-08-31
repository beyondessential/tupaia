/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
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
  },
];

const EXPANSION_CONFIG = [
  {
    title: 'Entities',
    endpoint: 'country/{id}/entities',
    columns: ENTITIES_COLUMNS,
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
  title: 'Export Survey Responses for Country',
  actionConfig: {
    exportEndpoint: 'surveyResponses',
    rowIdQueryParameter: 'countryId',
    fileName: '{name} Survey Responses',
  },
  queryParameters: [
    {
      label: 'Surveys to Include',
      secondaryLabel: 'Please enter the names of the surveys to be exported.',
      parameterKey: 'surveyCodes',
      optionsEndpoint: 'country/{id}/surveys',
      optionValueKey: 'code',
      allowMultipleValues: true,
    },
  ],
};

export const CountriesPage = ({ getHeaderEl }) => (
  <ResourcePage
    title="Countries"
    endpoint="countries"
    columns={COLUMNS}
    expansionTabs={EXPANSION_CONFIG}
    createConfig={CREATE_CONFIG}
    filteredExportConfig={FILTERED_EXPORT_CONFIG}
    getHeaderEl={getHeaderEl}
  />
);

CountriesPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
