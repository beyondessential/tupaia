/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { MapOverlayGroupsPage as BaseMapOverlayGroupsPage } from '@tupaia/admin-panel';
import { getBaseEditorConfigs, getCreateConfigs } from '../helpers';
import { getColumnFilter } from '../../table/columnTypes';

const MAP_OVERLAY_GROUPS_ENDPOINT = 'mapOverlayGroups';

export const MapOverlayGroupsPage = ({ getHeaderEl, translate }) => {
  const ColumnFilter = getColumnFilter(translate);

  const EDIT_FIELDS = [
    {
      Header: translate('admin.code'),
      source: 'code',
      type: 'tooltip',
      Fitler: ColumnFilter,
    },
    {
      Header: translate('admin.name'),
      source: 'name',
      width: 140,
      type: 'tooltip',
      Fitler: ColumnFilter,
    },
  ];

  const FIELDS = [
    {
      Header: 'ID',
      source: 'id',
      type: 'tooltip',
      Fitler: ColumnFilter,
    },
    ...EDIT_FIELDS,
  ];

  const COLUMNS = [
    ...FIELDS,
    {
      Header: translate('admin.edit'),
      type: 'edit',
      source: 'id',
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
      type: 'tooltip',
      Fitler: ColumnFilter,
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

  const EXPANSION_CONFIG = [
    {
      title: translate('admin.mapOverlayGroupRelations'),
      columns: RELATION_COLUMNS,
      endpoint: 'mapOverlayGroups/{id}/mapOverlayGroupRelations',
    },
  ];

  const editorConfig = getBaseEditorConfigs(translate);
  const createConfig = getCreateConfigs(translate, {
    editEndpoint: MAP_OVERLAY_GROUPS_ENDPOINT,
    fields: EDIT_FIELDS,
  });

  return (
    <BaseMapOverlayGroupsPage
      title={translate('admin.mapOverlayGroups')}
      endpoint={MAP_OVERLAY_GROUPS_ENDPOINT}
      columns={COLUMNS}
      expansionTabs={EXPANSION_CONFIG}
      getHeaderEl={getHeaderEl}
      createConfig={createConfig}
      editorConfig={editorConfig}
    />
  );
};

MapOverlayGroupsPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired,
};
