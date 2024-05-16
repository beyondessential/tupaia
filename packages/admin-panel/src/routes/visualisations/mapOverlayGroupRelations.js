/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
export const RELATION_ENDPOINT = 'mapOverlayGroupRelations';

export const MAP_OVERLAY_GROUP_RELATION_FIELDS = {
  MAP_OVERLAY_GROUP_CODE: {
    Header: 'Map Overlay Group Code',
    source: 'map_overlay_group.code',
    type: 'tooltip',
    required: true,
    editConfig: {
      optionsEndpoint: 'mapOverlayGroups',
      optionLabelKey: 'map_overlay_group.code',
      optionValueKey: 'map_overlay_group.id',
      sourceKey: 'map_overlay_group_id',
    },
  },
  CHILD_ID: {
    Header: 'Child Id',
    source: 'child_id',
    type: 'tooltip',
    required: true,
    editConfig: {
      optionsEndpoint: 'mapOverlays',
      optionLabelKey: 'mapOverlay.id',
      optionValueKey: 'mapOverlay.id',
      canCreateNewOptions: true,
      sourceKey: 'child_id',
    },
  },
  CHILD_TYPE: {
    Header: 'Child Type',
    width: 160,
    source: 'child_type',
    type: 'tooltip',
    required: true,
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
  SORT_ORDER: {
    Header: 'Sort Order',
    source: 'sort_order',
    type: 'tooltip',
  },
};

const FIELDS = Object.values(MAP_OVERLAY_GROUP_RELATION_FIELDS);

const COLUMNS = [
  ...FIELDS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      title: 'Edit Map Overlay Group Relation',
      editEndpoint: 'mapOverlayGroupRelations',
      fields: FIELDS,
    },
  },
  {
    Header: 'Delete',
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

export const mapOverlayGroupRelations = {
  title: 'Map overlay group relations',
  path: '/map-overlay-group-relations',
  endpoint: RELATION_ENDPOINT,
  columns: COLUMNS,
  createConfig: CREATE_CONFIG,
};
