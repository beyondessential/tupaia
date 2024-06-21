/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

const RESOURCE_NAME = { singular: 'map overlay group' };
const MAP_OVERLAY_GROUPS_ENDPOINT = 'mapOverlayGroups';

const childType = {
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
};

const childCode = {
  Header: 'Child code',
  source: 'child_code',
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

const sortOrder = {
  Header: 'Sort order',
  source: 'sort_order',
};

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

const RELATION_FIELDS = [childType, childMapOverlayCode, childMapOverlayGroupCode, sortOrder];

export const RELATION_COLUMNS = [
  childType,
  childCode,
  sortOrder,
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
      title: 'Map overlay group relations',
      columns: RELATION_COLUMNS,
      endpoint: 'mapOverlayGroups/{id}/mapOverlayGroupRelations',
      path: '/:id/map-overlay-group-relations',
      displayProperty: 'code',
    },
  ],
};
