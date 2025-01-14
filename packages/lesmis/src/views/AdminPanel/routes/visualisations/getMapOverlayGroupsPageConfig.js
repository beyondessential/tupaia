import { mapOverlayGroups } from '@tupaia/admin-panel';
import { getColumnFilter } from '../../table/columnTypes';
import { getBaseEditorConfigs, getCreateConfigs } from '../helpers';

export const getMapOverlayGroupsPageConfig = translate => {
  const EDIT_FIELDS = [
    {
      Header: translate('admin.code'),
      source: 'code',

      Filter: getColumnFilter(translate),
    },
    {
      Header: translate('admin.name'),
      source: 'name',
      width: 140,

      Filter: getColumnFilter(translate),
    },
  ];

  const FIELDS = [
    {
      Header: 'ID',
      source: 'id',

      Filter: getColumnFilter(translate),
    },
    ...EDIT_FIELDS,
  ];

  const COLUMNS = [
    ...FIELDS,
    {
      Header: translate('admin.edit'),
      type: 'edit',
      actionConfig: {
        title: translate('admin.edit'),
        editEndpoint: 'mapOverlayGroups',
        fields: EDIT_FIELDS,
      },
    },
  ];

  const RELATION_FIELDS = [
    {
      Header: translate('admin.childId'),
      source: 'child_id',

      Filter: getColumnFilter(translate),
      editConfig: {
        optionsEndpoint: 'mapOverlays',
        optionLabelKey: 'mapOverlay.id',
        optionValueKey: 'mapOverlay.id',
        sourceKey: 'child_id',
      },
    },
    {
      Header: translate('admin.childType'),
      source: 'child_type',

      Filter: getColumnFilter(translate),
      editConfig: {
        options: [
          {
            label: translate('admin.mapOverlay'),
            value: 'mapOverlay',
          },
          {
            label: translate('admin.mapOverlayGroup'),
            value: 'mapOverlayGroup',
          },
        ],
      },
    },
    {
      Header: translate('admin.sortOrder'),
      source: 'sort_order',

      Filter: getColumnFilter(translate),
    },
  ];

  const RELATION_COLUMNS = [
    ...RELATION_FIELDS,
    {
      Header: translate('admin.edit'),
      type: 'edit',
      source: 'id',
      actionConfig: {
        editEndpoint: 'mapOverlayGroupRelations',
        fields: RELATION_FIELDS,
      },
    },
  ];

  const editorConfig = getBaseEditorConfigs(translate);
  const createConfig = getCreateConfigs(translate, {
    actionConfig: {
      editEndpoint: mapOverlayGroups.endpoint,
      fields: EDIT_FIELDS,
    },
  });

  return {
    ...mapOverlayGroups,
    label: translate('admin.mapOverlayGroups'),
    columns: COLUMNS,
    editorConfig,
    createConfig,
    nestedViews: [
      {
        ...mapOverlayGroups.nestedViews[0],
        label: translate('admin.mapOverlayGroupRelations'),
        columns: RELATION_COLUMNS,
      },
    ],
  };
};
