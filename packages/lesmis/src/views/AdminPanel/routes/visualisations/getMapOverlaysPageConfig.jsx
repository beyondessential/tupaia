import React from 'react';
import { mapOverlays, ActionButton } from '@tupaia/admin-panel';
import { Link } from 'react-router-dom';
import { AddCircle } from '@material-ui/icons';
import { getArrayFilter, getBooleanSelectFilter, getColumnFilter } from '../../table/columnTypes';
import { prettyArray } from '../../utilities';
import {
  getBaseEditorConfigs,
  getDeleteColumnConfigs,
  getDeleteConfigs,
  getImportConfigs,
} from '../helpers';

export const getMapOverlaysPageConfig = (translate, adminUrl, isBESAdmin) => {
  const FIELDS = [
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
    {
      Header: translate('admin.permissionGroup'),
      width: 160,
      source: 'permission_group',
      editConfig: {
        optionsEndpoint: 'permissionGroups',
        optionLabelKey: 'name',
        optionValueKey: 'name',
        sourceKey: 'permission_group',
      },
      Filter: getColumnFilter(translate),
    },
    {
      Header: 'Linked Measures',
      source: 'linked_measures',
      width: 160,
      Cell: ({ value }) => prettyArray(value),
      Filter: getArrayFilter(translate),
      editConfig: {
        optionsEndpoint: mapOverlays.endpoint,
        optionLabelKey: 'id',
        sourceKey: 'linked_measures',
        allowMultipleValues: true,
      },
    },
    {
      Header: translate('admin.config'),
      source: 'config',
      type: 'jsonTooltip',
      Filter: getColumnFilter(translate),
      width: 200,
      editConfig: { type: 'jsonEditor' },
    },
    {
      Header: translate('admin.countryCodes'),
      source: 'country_codes',
      width: 140,
      Cell: ({ value }) => prettyArray(value),
      Filter: getArrayFilter(translate),
      editConfig: {
        optionsEndpoint: 'entities',
        optionLabelKey: 'code',
        optionValueKey: 'code',
        sourceKey: 'country_codes',
        allowMultipleValues: true,
      },
    },
    {
      Header: translate('admin.projectCodes'),
      source: 'project_codes',
      width: 140,
      Cell: ({ value }) => prettyArray(value),
      Filter: getArrayFilter(translate),
      editConfig: {
        optionsEndpoint: 'projects',
        optionLabelKey: 'code',
        optionValueKey: 'code',
        sourceKey: 'project_codes',
        allowMultipleValues: true,
      },
    },
    {
      Header: translate('admin.reportCode'),
      source: 'report_code',
      width: 140,

      Filter: getColumnFilter(translate),
    },
    {
      Header: translate('admin.legacy'),
      source: 'legacy',
      width: 140,
      type: 'boolean',
      Filter: getBooleanSelectFilter(translate),
      editConfig: { type: 'boolean' },
    },
  ];

  const extraEditFields = [
    // ID field for constructing viz-builder path only, not for showing or editing
    {
      Header: 'ID',
      source: 'id',
      show: false,
    },
    {
      Header: 'Edit using Visualisation Builder',
      type: 'link',
      show: isBESAdmin,
      editConfig: {
        type: 'link',
        linkOptions: {
          path: `${adminUrl}/viz-builder/map-overlay/:id`,
          parameters: { id: 'id' },
        },
        visibilityCriteria: {
          legacy: false,
        },
      },
    },
  ];

  const COLUMNS = [
    ...FIELDS,
    {
      Header: translate('admin.export'),
      type: 'export',
      actionConfig: {
        exportEndpoint: 'mapOverlayVisualisation',
        fileName: '{code}',
      },
    },
    {
      Header: translate('admin.edit'),
      type: 'edit',
      source: 'id',
      actionConfig: {
        title: translate('admin.edit'),
        editEndpoint: mapOverlays.endpoint,
        fields: [...FIELDS, ...extraEditFields],
      },
    },
    getDeleteColumnConfigs(mapOverlays.endpoint, translate),
  ];

  const importConfig = getImportConfigs(translate, {
    subtitle: 'Please upload one or more .json files with visualisations to be imported:',
    actionConfig: {
      importEndpoint: 'mapOverlayVisualisations',
      multiple: true,
    },
    getFinishedMessage: response => (
      <>
        <span>{response.message}</span>
        {response.importedVizes.map(({ code, id }) => (
          <p>
            <span>{`${code}: `}</span>
            <Link to={`${adminUrl}/viz-builder/map-overlay/${id}`}>
              View in Visualisation Builder
            </Link>
          </p>
        ))}
      </>
    ),
  });

  const renderNewMapOverlayVizButton = () => (
    <ActionButton
      startIcon={<AddCircle />}
      to={`${adminUrl}/viz-builder/map-overlay/new`}
      component={Link}
    >
      {translate('admin.new')}
    </ActionButton>
  );
  const editorConfig = getBaseEditorConfigs(translate);
  const deleteConfig = getDeleteConfigs(translate);
  return {
    ...mapOverlays,
    label: translate('admin.mapOverlays'),
    columns: COLUMNS,
    importConfig,
    LinksComponent: renderNewMapOverlayVizButton,
    editorConfig,
    deleteConfig,
    needsBESAdminAccess: [],
  };
};
