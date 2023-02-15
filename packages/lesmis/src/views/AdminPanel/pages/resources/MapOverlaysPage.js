/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { LightOutlinedButton } from '@tupaia/ui-components';
import { MapOverlaysPage as BaseMapOverlaysPage } from '@tupaia/admin-panel';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { Link } from 'react-router-dom';
import { prettyArray } from '../../utilities';
import { getArrayFilter, getBooleanSelectFilter, getColumnFilter } from '../../table/columnTypes';
import { getImportConfigs } from '../helpers/getImportConfigs';
import { getBaseEditorConfigs, getDeleteConfigs } from '../helpers';
import { getDeleteColumnConfigs } from '../helpers/getDeleteColumnConfigs';

const StyledLink = styled(Link)`
  text-decoration: none;
  &:focus,
  &:hover,
  &:visited,
  &:link,
  &:active {
    text-decoration: none;
  }
`;

export const MAP_OVERLAYS_ENDPOINT = 'mapOverlays';

export const MapOverlaysPage = ({ getHeaderEl, isLesmisAdmin, vizBuilderBaseUrl, translate }) => {
  const FIELDS = [
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
        optionsEndpoint: MAP_OVERLAYS_ENDPOINT,
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
      type: 'tooltip',
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
      show: isLesmisAdmin,
      editConfig: {
        type: 'link',
        linkOptions: {
          path: `${vizBuilderBaseUrl}/viz-builder/map-overlay/:id`,
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
      source: 'id',
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
        editEndpoint: MAP_OVERLAYS_ENDPOINT,
        fields: [...FIELDS, ...extraEditFields],
      },
    },
    getDeleteColumnConfigs(MAP_OVERLAYS_ENDPOINT, translate),
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
            <Link to={`${vizBuilderBaseUrl}/viz-builder/map-overlay/${id}`}>
              View in Visualisation Builder
            </Link>
          </p>
        ))}
      </>
    ),
  });

  const renderNewMapOverlayVizButton = () => (
    <StyledLink to={`${vizBuilderBaseUrl}/viz-builder/map-overlay/new`}>
      <LightOutlinedButton startIcon={<AddCircleIcon />}>
        {translate('admin.new')}
      </LightOutlinedButton>
    </StyledLink>
  );
  const editorConfig = getBaseEditorConfigs(translate);
  const deleteConfig = getDeleteConfigs(translate);

  return (
    <BaseMapOverlaysPage
      title={translate('admin.mapOverlays')}
      endpoint="mapOverlays"
      columns={COLUMNS}
      importConfig={importConfig}
      editorConfig={editorConfig}
      deleteConfig={deleteConfig}
      LinksComponent={renderNewMapOverlayVizButton}
      getHeaderEl={getHeaderEl}
    />
  );
};

MapOverlaysPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired,
  isLesmisAdmin: PropTypes.bool,
  vizBuilderBaseUrl: PropTypes.string,
};

MapOverlaysPage.defaultProps = {
  isLesmisAdmin: false,
  vizBuilderBaseUrl: '',
};
