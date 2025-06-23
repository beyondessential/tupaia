const RESOURCE_NAME = { singular: 'map overlay group relation' };

export const RELATION_ENDPOINT = 'mapOverlayGroupRelations';

export const FIELDS = {
  MAP_OVERLAY_GROUP_CODE: {
    Header: 'Map overlay group code',
    source: 'map_overlay_group.code',
    required: true,
    editConfig: {
      optionsEndpoint: 'mapOverlayGroups',
      optionLabelKey: 'map_overlay_group.code',
      optionValueKey: 'map_overlay_group.id',
      sourceKey: 'map_overlay_group_id',
      accessor: record => record['map_overlay_group.code'],
    },
  },
  CHILD_TYPE: {
    Header: 'Child type',
    required: true,
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
  CHILD_CODE: {
    Header: 'Child code',
    source: 'child_code',
  },
  CHILD_MAP_OVERLAY_CODE: {
    Header: 'Child map overlay code',
    id: 'child_map_overlay_code',
    source: 'child_code',
    required: true,
    editConfig: {
      optionsEndpoint: 'mapOverlays',
      optionLabelKey: 'mapOverlay.code',
      optionValueKey: 'mapOverlay.id',
      sourceKey: 'child_id',
      visibilityCriteria: { child_type: 'mapOverlay' },
      accessor: record => record['child_code'],
    },
  },
  CHILD_MAP_OVERLAY_GROUP_CODE: {
    Header: 'Child map overlay group code',
    id: 'child_map_overlay_group_code',
    required: true,
    source: 'child_code',
    editConfig: {
      optionsEndpoint: 'mapOverlayGroups',
      optionLabelKey: 'mapOverlayGroups.code',
      optionValueKey: 'mapOverlayGroups.id',
      sourceKey: 'child_id',
      visibilityCriteria: { child_type: 'mapOverlayGroup' },
      accessor: record => record['map_overlay_group.code'],
    },
  },
  SORT_ORDER: {
    Header: 'Sort order',
    source: 'sort_order',
  },
};

const EDIT_FIELDS = [
  FIELDS.MAP_OVERLAY_GROUP_CODE,
  FIELDS.CHILD_TYPE,
  FIELDS.CHILD_MAP_OVERLAY_CODE,
  FIELDS.CHILD_MAP_OVERLAY_GROUP_CODE,
  FIELDS.SORT_ORDER,
];

const COLUMNS = [
  FIELDS.MAP_OVERLAY_GROUP_CODE,
  FIELDS.CHILD_TYPE,
  FIELDS.CHILD_CODE,
  FIELDS.SORT_ORDER,
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
  needsVizBuilderAccess: ['create'],
};
