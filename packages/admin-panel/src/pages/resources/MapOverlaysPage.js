/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ResourcePage } from './ResourcePage';
import { prettyJSON, prettyArray } from '../../utilities';

const FIELDS = [
  {
    Header: 'ID',
    source: 'id',
  },
  {
    Header: 'Name',
    source: 'name',
  },
  {
    Header: 'Permission Group',
    source: 'userGroup',
    editConfig: {
      optionsEndpoint: 'permissionGroups',
      optionLabelKey: 'name',
      optionValueKey: 'name',
      sourceKey: 'userGroup',
    },
  },
  {
    Header: 'Data Element Code',
    source: 'dataElementCode',
  },
  {
    Header: 'Measure Builder',
    source: 'measureBuilder',
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
    Cell: ({ value }) => prettyJSON(value),
    editConfig: { type: 'jsonEditor' },
  },
  {
    Header: 'isDataRegional',
    source: 'isDataRegional',
    type: 'boolean',
  },
  {
    Header: 'Linked Measures',
    source: 'linkedMeasures',
    Cell: ({ value }) => prettyArray(value),
    editConfig: {
      optionsEndpoint: 'mapOverlays',
      optionLabelKey: 'id',
      sourceKey: 'linkedMeasures',
      allowMultipleValues: true,
    },
  },
  {
    Header: 'Sort Order',
    source: 'sortOrder',
  },
  {
    Header: 'Presentation Options',
    source: 'presentationOptions',
    Cell: ({ value }) => prettyJSON(value),
    editConfig: { type: 'jsonEditor' },
  },
  {
    Header: 'Country Codes',
    source: 'countryCodes',
    Cell: ({ value }) => prettyArray(value),
    editConfig: {
      optionsEndpoint: 'entities',
      optionLabelKey: 'code',
      optionValueKey: 'code',
      sourceKey: 'countryCodes',
      allowMultipleValues: true,
    },
  },
  {
    Header: 'Project Codes',
    source: 'projectCodes',
    Cell: ({ value }) => prettyArray(value),
    editConfig: {
      optionsEndpoint: 'projects',
      optionLabelKey: 'code',
      optionValueKey: 'code',
      sourceKey: 'projectCodes',
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
