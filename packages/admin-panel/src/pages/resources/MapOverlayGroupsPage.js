/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ResourcePage } from './ResourcePage';

const EDIT_FIELDS = [
  {
    Header: 'Code',
    source: 'code',
    type: 'tooltip',
  },
  {
    Header: 'Name',
    source: 'name',
    width: 140,
    type: 'tooltip',
  },
];

const FIELDS = [
  {
    Header: 'ID',
    source: 'id',
    type: 'tooltip',
  },
  ...EDIT_FIELDS,
];

const COLUMNS = [
  ...FIELDS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      editEndpoint: 'mapOverlayGroups',
      fields: EDIT_FIELDS,
    },
  },
];

export const RELATION_FIELDS = [
  {
    Header: 'Child Id',
    source: 'child_id',
    type: 'tooltip',
    editConfig: {
      optionsEndpoint: 'mapOverlays',
      optionLabelKey: 'mapOverlay.id',
      optionValueKey: 'mapOverlay.id',
      sourceKey: 'child_id',
    },
  },
  {
    Header: 'Child Type',
    source: 'child_type',
    type: 'tooltip',
    editConfig: {
      options: [
        {
          label: 'Map Overlay',
          value: 'mapOverlay',
        },
        {
          label: 'Map Overlay Group',
          value: 'mapOverlayGroup',
        },
      ],
    },
  },
  {
    Header: 'Sort Order',
    source: 'sort_order',
    type: 'tooltip',
  },
];

export const RELATION_COLUMNS = [
  ...RELATION_FIELDS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      editEndpoint: 'mapOverlayGroupRelations',
      fields: RELATION_FIELDS,
    },
  },
];

const EXPANSION_CONFIG = [
  {
    title: 'Map Overlay Group Relations',
    columns: RELATION_COLUMNS,
    endpoint: 'mapOverlayGroups/{id}/mapOverlayGroupRelations',
  },
];

export const MapOverlayGroupsPage = ({ getHeaderEl }) => (
  <ResourcePage
    title="Map Overlay Groups"
    endpoint="mapOverlayGroups"
    columns={COLUMNS}
    expansionTabs={EXPANSION_CONFIG}
    getHeaderEl={getHeaderEl}
    editConfig={{
      title: 'Edit Map Overlay Group',
    }}
  />
);

MapOverlayGroupsPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
