/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ResourcePage } from './ResourcePage';
import { prettyArray } from '../../utilities';

const FIELDS = [
  {
    Header: 'ID',
    source: 'id',
    type: 'tooltip',
  },
  {
    Header: 'Name',
    source: 'name',
    width: 140,
    type: 'tooltip',
  },
  {
    Header: 'Permission Group',
    width: 160,
    source: 'permission_group',
    editConfig: {
      optionsEndpoint: 'permissionGroups',
      optionLabelKey: 'name',
      optionValueKey: 'name',
      sourceKey: 'permission_group',
    },
  },
  {
    Header: 'Data Element Code',
    source: 'dataElementCode',
    width: 170,
  },
  {
    Header: 'Measure Builder',
    source: 'measureBuilder',
    width: 170,
    editConfig: {
      optionsEndpoint: 'mapOverlays',
      optionLabelKey: 'measureBuilder',
      optionValueKey: 'measureBuilder',
      sourceKey: 'measureBuilder',
    },
  },
  {
    Header: 'Measure Builder Config',
    source: 'measureBuilderConfig',
    type: 'jsonTooltip',
    width: 200,
    editConfig: { type: 'jsonEditor' },
  },
  {
    Header: 'Linked Measures',
    source: 'linked_measures',
    width: 160,
    Cell: ({ value }) => prettyArray(value),
    editConfig: {
      optionsEndpoint: 'mapOverlays',
      optionLabelKey: 'id',
      sourceKey: 'linked_measures',
      allowMultipleValues: true,
    },
  },
  {
    Header: 'Presentation Config',
    source: 'config',
    type: 'jsonTooltip',
    width: 200,
    editConfig: { type: 'jsonEditor' },
  },
  {
    Header: 'Country Codes',
    source: 'country_codes',
    width: 140,
    Cell: ({ value }) => prettyArray(value),
    editConfig: {
      optionsEndpoint: 'entities',
      optionLabelKey: 'code',
      optionValueKey: 'code',
      sourceKey: 'country_codes',
      allowMultipleValues: true,
    },
  },
  {
    Header: 'Project Codes',
    source: 'project_codes',
    width: 140,
    Cell: ({ value }) => prettyArray(value),
    editConfig: {
      optionsEndpoint: 'projects',
      optionLabelKey: 'code',
      optionValueKey: 'code',
      sourceKey: 'project_codes',
      allowMultipleValues: true,
    },
  },
];

const COLUMNS = [
  ...FIELDS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      editEndpoint: 'mapOverlays',
      fields: [...FIELDS],
    },
  },
];

export const MapOverlaysPage = ({ getHeaderEl }) => (
  <ResourcePage
    title="Map Overlays"
    endpoint="mapOverlays"
    columns={COLUMNS}
    getHeaderEl={getHeaderEl}
    editConfig={{
      title: 'Edit Map Overlay',
    }}
  />
);

MapOverlaysPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
