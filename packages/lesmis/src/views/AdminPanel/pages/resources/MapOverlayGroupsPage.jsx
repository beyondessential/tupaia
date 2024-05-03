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

export const MapOverlayGroupsPage = ({ translate }) => {
  const EDIT_FIELDS = [
    {
      Header: translate('admin.code'),
      source: 'code',
      type: 'tooltip',
      Filter: getColumnFilter(translate),
    },
    {
      Header: translate('admin.name'),
      source: 'name',
      width: 140,
      type: 'tooltip',
      Filter: getColumnFilter(translate),
    },
  ];

  const FIELDS = [
    {
      Header: 'ID',
      source: 'id',
      type: 'tooltip',
      Filter: getColumnFilter(translate),
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

  const expansionConfig = [
    {
      title: translate('admin.mapOverlayGroupRelations'),
      columns: RELATION_COLUMNS,
      endpoint: 'mapOverlayGroups/{id}/mapOverlayGroupRelations',
    },
  ];

  const editorConfig = getBaseEditorConfigs(translate);
  const createConfig = getCreateConfigs(translate, {
    actionConfig: {
      editEndpoint: MAP_OVERLAY_GROUPS_ENDPOINT,
      fields: EDIT_FIELDS,
    },
  });

  return (
    <BaseMapOverlayGroupsPage
      title={translate('admin.mapOverlayGroups')}
      endpoint={MAP_OVERLAY_GROUPS_ENDPOINT}
      columns={COLUMNS}
      expansionTabs={expansionConfig}
      createConfig={createConfig}
      editorConfig={editorConfig}
    />
  );
};

MapOverlayGroupsPage.propTypes = {
  translate: PropTypes.func.isRequired,
};
