/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { LightOutlinedButton } from '@tupaia/ui-components';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { Link } from 'react-router-dom';
import { prettyArray } from '../../utilities';
import { ResourcePage } from './ResourcePage';
import { ArrayFilter } from '../../table/columnTypes/columnFilters';

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

const FIELDS = [
  {
    Header: 'Code',
    source: 'code',
    type: 'tooltip',
  },
  {
    Header: 'Name',
    source: 'name',
    width: 140,
    type: 'tooltip',
  },
  {
    Header: 'Permission Group',
    width: 160,
    source: 'permission_group',
    editConfig: {
      optionsEndpoint: 'permissionGroups',
      optionLabelKey: 'name',
      optionValueKey: 'name',
      sourceKey: 'permission_group',
    },
  },
  {
    Header: 'Linked Measures',
    source: 'linked_measures',
    width: 160,
    Cell: ({ value }) => prettyArray(value),
    Filter: ArrayFilter,
    editConfig: {
      optionsEndpoint: MAP_OVERLAYS_ENDPOINT,
      optionLabelKey: 'id',
      sourceKey: 'linked_measures',
      allowMultipleValues: true,
    },
  },
  {
    Header: 'Config',
    source: 'config',
    type: 'jsonTooltip',
    width: 200,
    editConfig: { type: 'jsonEditor' },
  },
  {
    Header: 'Country Codes',
    source: 'country_codes',
    width: 140,
    Cell: ({ value }) => prettyArray(value),
    Filter: ArrayFilter,
    editConfig: {
      optionsEndpoint: 'entities',
      optionLabelKey: 'code',
      optionValueKey: 'code',
      sourceKey: 'country_codes',
      allowMultipleValues: true,
    },
  },
  {
    Header: 'Project Codes',
    source: 'project_codes',
    width: 140,
    Cell: ({ value }) => prettyArray(value),
    Filter: ArrayFilter,
    editConfig: {
      optionsEndpoint: 'projects',
      optionLabelKey: 'code',
      optionValueKey: 'code',
      sourceKey: 'project_codes',
      allowMultipleValues: true,
    },
  },
  {
    Header: 'Report Code',
    source: 'report_code',
    width: 140,
    type: 'tooltip',
  },
  {
    Header: 'Legacy',
    source: 'legacy',
    width: 140,
    type: 'boolean',
    editConfig: { type: 'boolean' },
  },
];

const IMPORT_CONFIG = {
  title: 'Import Map Overlay Visualisation',
  subtitle: 'Please upload a .json file with the visualisation to be imported:',
  actionConfig: {
    importEndpoint: 'mapOverlayVisualisations',
  },
  getFinishedMessage: response => (
    <>
      <span>{response.message}</span>
      <p>
        <Link to={`/viz-builder/map-overlay/${response.id}`}>View in Visualisation Builder</Link>
      </p>
    </>
  ),
};

const renderNewMapOverlayVizButton = () => (
  <StyledLink to="/viz-builder/map-overlay/new">
    <LightOutlinedButton startIcon={<AddCircleIcon />}>New</LightOutlinedButton>
  </StyledLink>
);

export const MapOverlaysPage = ({ getHeaderEl, isBESAdmin, ...props }) => {
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
          path: '/viz-builder/map-overlay/:id',
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
      Header: 'Export',
      source: 'id',
      type: 'export',
      actionConfig: {
        exportEndpoint: 'mapOverlayVisualisation',
        fileName: '{code}',
      },
    },
    {
      Header: 'Edit',
      type: 'edit',
      source: 'id',
      actionConfig: {
        editEndpoint: MAP_OVERLAYS_ENDPOINT,
        fields: [...FIELDS, ...extraEditFields],
      },
    },
    {
      Header: 'Delete',
      source: 'id',
      type: 'delete',
      actionConfig: {
        endpoint: MAP_OVERLAYS_ENDPOINT,
      },
    },
  ];

  return (
    <ResourcePage
      title="Map Overlays"
      endpoint="mapOverlays"
      columns={COLUMNS}
      importConfig={IMPORT_CONFIG}
      LinksComponent={renderNewMapOverlayVizButton}
      getHeaderEl={getHeaderEl}
      editConfig={{
        title: 'Edit Map Overlay',
      }}
      {...props}
    />
  );
};

MapOverlaysPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
  isBESAdmin: PropTypes.bool,
};

MapOverlaysPage.defaultProps = {
  isBESAdmin: false,
};
