/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { mapOverlayGroupRelations } from '@tupaia/admin-panel';
import { getColumnFilter } from '../../table/columnTypes';
import {
  getBaseEditorConfigs,
  getCreateConfigs,
  getDeleteColumnConfigs,
  getDeleteConfigs,
} from '../helpers';

export const getMapOverlayGroupRelationsPageConfig = translate => {
  const FIELDS = [
    {
      Header: translate('admin.code'),
      source: 'map_overlay_group.code',
      type: 'tooltip',
      Filter: getColumnFilter(translate),
      editConfig: {
        optionsEndpoint: 'mapOverlayGroups',
        optionLabelKey: 'map_overlay_group.code',
        optionValueKey: 'map_overlay_group.id',
        sourceKey: 'map_overlay_group_id',
      },
    },
    {
      Header: translate('admin.childId'),
      source: 'child_id',
      type: 'tooltip',
      Filter: getColumnFilter(translate),
      editConfig: {
        optionsEndpoint: 'mapOverlays',
        optionLabelKey: 'mapOverlay.id',
        optionValueKey: 'mapOverlay.id',
        canCreateNewOptions: true,
        sourceKey: 'child_id',
      },
    },
    {
      Header: translate('admin.childType'),
      width: 160,
      source: 'child_type',
      type: 'tooltip',
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
      type: 'tooltip',
      Filter: getColumnFilter(translate),
    },
  ];

  const COLUMNS = [
    ...FIELDS,
    {
      Header: translate('admin.edit'),
      type: 'edit',
      source: 'id',
      actionConfig: {
        title: translate('admin.edit'),
        editEndpoint: 'mapOverlayGroupRelations',
        fields: [...FIELDS],
      },
    },
    getDeleteColumnConfigs('mapOverlayGroupRelations', translate),
  ];

  const editorConfig = getBaseEditorConfigs(translate);
  const createConfig = getCreateConfigs(translate, {
    actionConfig: {
      editEndpoint: mapOverlayGroupRelations.endpoint,
      fields: FIELDS,
    },
  });
  const deleteConfig = getDeleteConfigs(translate);

  return {
    ...mapOverlayGroupRelations,
    title: translate('admin.mapOverlayGroupRelations'),
    columns: COLUMNS,
    editorConfig,
    createConfig,
    deleteConfig,
  };
};
