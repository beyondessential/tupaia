/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { FIELDS as RELATION_FIELDS, RELATION_ENDPOINT } from './mapOverlayGroupRelations';

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

export const RELATION_COLUMNS = [
  RELATION_FIELDS.CHILD_TYPE,
  RELATION_FIELDS.CHILD_CODE,
  RELATION_FIELDS.SORT_ORDER,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      editEndpoint: RELATION_ENDPOINT,
      fields: [
        // Cannot edit parent map overlay group from nested/drilled-down view
        RELATION_FIELDS.CHILD_TYPE,
        RELATION_FIELDS.CHILD_MAP_OVERLAY_CODE,
        RELATION_FIELDS.CHILD_MAP_OVERLAY_GROUP_CODE,
        RELATION_FIELDS.SORT_ORDER,
      ],
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
