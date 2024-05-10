/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

const RESOURCE_NAME = { singular: 'map overlay group' };

const MAP_OVERLAY_GROUPS_ENDPOINT = 'mapOverlayGroups';

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
    actionConfig: {
      title: `Edit ${RESOURCE_NAME.singular}`,
      editEndpoint: 'mapOverlayGroups',
      fields: EDIT_FIELDS,
    },
  },
];

export const RELATION_FIELDS = [
  {
    Header: 'Child ID',
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
    Header: 'Child type',
    source: 'child_type',
    type: 'tooltip',
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

const CREATE_CONFIG = {
  actionConfig: {
    title: `New ${RESOURCE_NAME.singular}`,
    editEndpoint: MAP_OVERLAY_GROUPS_ENDPOINT,
    fields: EDIT_FIELDS,
  },
};

export const mapOverlayGroups = {
  resourceName: RESOURCE_NAME,
  path: '/map-overlay-groups',
  endpoint: MAP_OVERLAY_GROUPS_ENDPOINT,
  columns: COLUMNS,
  createConfig: CREATE_CONFIG,
  nestedView: {
    title: 'Map Overlay Group Relations',
    columns: RELATION_COLUMNS,
    endpoint: 'mapOverlayGroups/{id}/mapOverlayGroupRelations',
    path: '/:id/map-overlay-group-relations',
    displayProperty: 'code',
  },
};
