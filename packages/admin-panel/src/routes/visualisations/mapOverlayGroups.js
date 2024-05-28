/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

const RESOURCE_NAME = { singular: 'map overlay group' };

const MAP_OVERLAY_GROUPS_ENDPOINT = 'mapOverlayGroups';

const FIELDS = [
  {
    Header: 'ID',
    source: 'id',
    show: false,
  },
  {
    Header: 'Code',
    source: 'code',
  },
  {
    Header: 'Name',
    source: 'name',
  },
];

const COLUMNS = [
  ...FIELDS,
  {
    Header: 'Edit',
    type: 'edit',
    actionConfig: {
      title: `Edit ${RESOURCE_NAME.singular}`,
      editEndpoint: MAP_OVERLAY_GROUPS_ENDPOINT,
      fields: FIELDS,
    },
  },
];

export const RELATION_FIELDS = [
  {
    Header: 'Child ID',
    source: 'child_id',

    editConfig: {
      optionsEndpoint: 'mapOverlays',
      optionLabelKey: 'mapOverlay.id',
      optionValueKey: 'mapOverlay.id',
      sourceKey: 'child_id',
    },
  },
  {
    Header: 'Child type',
    source: 'child_type',

    editConfig: {
      options: [
        {
          label: 'Map overlay',
          value: 'mapOverlay',
        },
        {
          label: 'Map overlay group',
          value: 'mapOverlayGroup',
        },
      ],
    },
  },
  {
    Header: 'Sort order',
    source: 'sort_order',
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

const CREATE_CONFIG = {
  actionConfig: {
    editEndpoint: MAP_OVERLAY_GROUPS_ENDPOINT,
    fields: FIELDS,
  },
};

export const mapOverlayGroups = {
  resourceName: RESOURCE_NAME,
  path: '/map-overlay-groups',
  endpoint: MAP_OVERLAY_GROUPS_ENDPOINT,
  columns: COLUMNS,
  createConfig: CREATE_CONFIG,
  nestedViews: [
    {
      title: 'Map Overlay Group Relations',
      columns: RELATION_COLUMNS,
      endpoint: 'mapOverlayGroups/{id}/mapOverlayGroupRelations',
      path: '/:id/map-overlay-group-relations',
      displayProperty: 'code',
    },
  ],
};
