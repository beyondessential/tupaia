/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

const RESOURCE_NAME = { singular: 'map overlay group relation' };

export const RELATION_ENDPOINT = 'mapOverlayGroupRelations';

const mapOverlayGroupCode = {
  Header: 'Map overlay group code',
  source: 'map_overlay_group.code',
  required: true,
  editConfig: {
    optionsEndpoint: 'mapOverlayGroups',
    optionLabelKey: 'map_overlay_group.code',
    optionValueKey: 'map_overlay_group.id',
    sourceKey: 'map_overlay_group_id',
  },
};

const childType = {
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
};

const childCode = {
  Header: 'Child Code',
  source: 'child_code',
  required: true,
};

const childMapOverlayCode = {
  Header: 'Child map overlay code',
  id: 'child_map_overlay_code',
  source: 'child_code',
  editConfig: {
    optionsEndpoint: 'mapOverlays',
    optionLabelKey: 'mapOverlay.code',
    optionValueKey: 'mapOverlay.id',
    sourceKey: 'child_id',
    visibilityCriteria: { child_type: 'mapOverlay' },
  },
};

const childMapOverlayGroupCode = {
  Header: 'Child map overlay group code',
  id: 'child_map_overlay_group_code',
  source: 'child_code',
  editConfig: {
    optionsEndpoint: 'mapOverlayGroups',
    optionLabelKey: 'mapOverlayGroups.code',
    optionValueKey: 'mapOverlayGroups.id',
    sourceKey: 'child_id',
    visibilityCriteria: { child_type: 'mapOverlayGroup' },
  },
};

const sortOrder = {
  Header: 'Sort order',
  source: 'sort_order',
};

const EDIT_FIELDS = [
  mapOverlayGroupCode,
  childType,
  childMapOverlayCode,
  childMapOverlayGroupCode,
  sortOrder,
];

const COLUMNS = [
  mapOverlayGroupCode,
  childType,
  childCode,
  sortOrder,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      title: `Edit ${RESOURCE_NAME.singular}`,
      editEndpoint: RELATION_ENDPOINT,
      fields: EDIT_FIELDS,
    },
  },
  {
    Header: 'Delete',
    type: 'delete',
    actionConfig: {
      endpoint: RELATION_ENDPOINT,
    },
  },
];

const CREATE_CONFIG = {
  actionConfig: {
    editEndpoint: RELATION_ENDPOINT,
    fields: EDIT_FIELDS,
  },
};

export const mapOverlayGroupRelations = {
  resourceName: RESOURCE_NAME,
  path: '/map-overlay-group-relations',
  endpoint: RELATION_ENDPOINT,
  columns: COLUMNS,
  createConfig: CREATE_CONFIG,
};
