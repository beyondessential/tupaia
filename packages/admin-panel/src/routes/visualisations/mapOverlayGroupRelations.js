/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

const RESOURCE_NAME = { singular: 'map overlay group relation' };

export const RELATION_ENDPOINT = 'mapOverlayGroupRelations';

export const MAP_OVERLAY_GROUP_RELATION_FIELDS = {
  MAP_OVERLAY_GROUP_CODE: {
    Header: 'Map overlay group code',
    source: 'map_overlay_group.code',
    required: true,
    editConfig: {
      optionsEndpoint: 'mapOverlayGroups',
      optionLabelKey: 'map_overlay_group.code',
      optionValueKey: 'map_overlay_group.id',
      sourceKey: 'map_overlay_group_id',
    },
  },
  CHILD_ID: {
    Header: 'Child ID',
    source: 'child_id',
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
    Header: 'Child type',
    width: 160,
    source: 'child_type',
    required: true,
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
  SORT_ORDER: {
    Header: 'Sort order',
    source: 'sort_order',
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
      title: `Edit ${RESOURCE_NAME.singular}`,
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
  actionConfig: {
    editEndpoint: RELATION_ENDPOINT,
    fields: FIELDS,
  },
};

export const mapOverlayGroupRelations = {
  resourceName: RESOURCE_NAME,
  path: '/map-overlay-group-relations',
  endpoint: RELATION_ENDPOINT,
  columns: COLUMNS,
  createConfig: CREATE_CONFIG,
};
