/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { MAP_OVERLAY_GROUP_RELATION_FIELDS } from './mapOverlayGroupRelations';

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
    required: true,
  },
  {
    Header: 'Name',
    source: 'name',
    required: true,
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
  MAP_OVERLAY_GROUP_RELATION_FIELDS.CHILD_ID,
  MAP_OVERLAY_GROUP_RELATION_FIELDS.CHILD_TYPE,
  MAP_OVERLAY_GROUP_RELATION_FIELDS.SORT_ORDER,
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
      title: 'Map overlay group relations',
      columns: RELATION_COLUMNS,
      endpoint: 'mapOverlayGroups/{id}/mapOverlayGroupRelations',
      path: '/:id/map-overlay-group-relations',
      displayProperty: 'code',
    },
  ],
};
