/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { MAP_OVERLAY_GROUP_RELATION_FIELDS } from './mapOverlayGroupRelations';

const MAP_OVERLAY_GROUPS_ENDPOINT = 'mapOverlayGroups';

const EDIT_FIELDS = [
  {
    Header: 'Code',
    source: 'code',
    type: 'tooltip',
    required: true,
  },
  {
    Header: 'Name',
    source: 'name',
    width: 140,
    type: 'tooltip',
    required: true,
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
      title: 'Edit Map Overlay Group',
      editEndpoint: 'mapOverlayGroups',
      fields: EDIT_FIELDS,
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
  title: 'Create a new Map overlay group',
  actionConfig: {
    editEndpoint: MAP_OVERLAY_GROUPS_ENDPOINT,
    fields: EDIT_FIELDS,
  },
};

export const mapOverlayGroups = {
  title: 'Map overlay groups',
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
