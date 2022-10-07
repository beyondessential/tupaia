/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ResourcePage } from './ResourcePage';

export const RELATION_ENDPOINT = 'mapOverlayGroupRelations';

const FIELDS = [
  {
    Header: 'Map Overlay Group Code',
    source: 'map_overlay_group.code',
    type: 'tooltip',
    editConfig: {
      optionsEndpoint: 'mapOverlayGroups',
      optionLabelKey: 'map_overlay_group.code',
      optionValueKey: 'map_overlay_group.id',
      sourceKey: 'map_overlay_group_id',
    },
  },
  {
    Header: 'Child Id',
    source: 'child_id',
    type: 'tooltip',
    editConfig: {
      optionsEndpoint: 'mapOverlays',
      optionLabelKey: 'mapOverlay.id',
      optionValueKey: 'mapOverlay.id',
      canCreateNewOptions: true,
      sourceKey: 'child_id',
    },
  },
  {
    Header: 'Child Code',
    source: 'childCode',
    type: 'tooltip',
  },
  {
    Header: 'Child Type',
    width: 160,
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

const COLUMNS = [
  ...FIELDS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      title: 'Edit Map Overlay Group Relation',
      editEndpoint: 'mapOverlayGroupRelations',
      fields: [...FIELDS],
    },
  },
  {
    Header: 'Delete',
    source: 'id',
    type: 'delete',
    actionConfig: {
      endpoint: 'mapOverlayGroupRelations',
    },
  },
];

const CREATE_CONFIG = {
  title: 'Create a new relation between Map Overlay and Map Overlay Group',
  actionConfig: {
    editEndpoint: RELATION_ENDPOINT,
    fields: FIELDS,
  },
};

export const MapOverlayGroupRelationsPage = ({ getHeaderEl }) => (
  <ResourcePage
    title="Map Overlay Group Relations"
    endpoint="mapOverlayGroupRelations"
    columns={COLUMNS}
    createConfig={CREATE_CONFIG}
    getHeaderEl={getHeaderEl}
  />
);

MapOverlayGroupRelationsPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
