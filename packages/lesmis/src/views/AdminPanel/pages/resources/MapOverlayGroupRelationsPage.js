/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { MapOverlayGroupRelationsPage as BaseMapOverlayGroupRelationsPage } from '@tupaia/admin-panel';
import { getBaseEditorConfigs, getCreateConfigs, getDeleteConfigs } from '../helpers';
import { getColumnFilter } from '../../table/columnTypes';
import { getDeleteColumnConfigs } from '../helpers/getDeleteColumnConfigs';

export const RELATION_ENDPOINT = 'mapOverlayGroupRelations';

export const MapOverlayGroupRelationsPage = ({ getHeaderEl, translate }) => {
  const ColumnFilter = getColumnFilter(translate);

  const FIELDS = [
    {
      Header: translate('admin.code'),
      source: 'map_overlay_group.code',
      type: 'tooltip',
      Fitler: ColumnFilter,
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
      Fitler: ColumnFilter,
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
      Fitler: ColumnFilter,
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
      Fitler: ColumnFilter,
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
      editEndpoint: RELATION_ENDPOINT,
      fields: FIELDS,
    },
  });
  const deleteConfig = getDeleteConfigs(translate);

  return (
    <BaseMapOverlayGroupRelationsPage
      title={translate('admin.mapOverlayGroupRelations')}
      endpoint="mapOverlayGroupRelations"
      columns={COLUMNS}
      createConfig={createConfig}
      editorConfig={editorConfig}
      deleteConfig={deleteConfig}
      getHeaderEl={getHeaderEl}
    />
  );
};

MapOverlayGroupRelationsPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired,
};
