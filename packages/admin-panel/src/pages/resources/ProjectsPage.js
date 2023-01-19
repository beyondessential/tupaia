/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ResourcePage } from './ResourcePage';
import { prettyArray } from '../../utilities';
import { ArrayFilter } from '../../table/columnTypes/columnFilters';

const PROJECTS_ENDPOINT = 'projects';

const FIELDS = [
  {
    Header: 'Code',
    source: 'code',
  },
  {
    Header: 'Description',
    source: 'description',
    type: 'tooltip',
  },
  {
    Header: 'Dashboard',
    source: 'dashboard_group_name',
    type: 'tooltip',
    editConfig: {
      optionsEndpoint: 'dashboards',
      optionLabelKey: 'name',
      optionValueKey: 'name',
      sourceKey: 'dashboard_group_name',
    },
  },
  {
    Header: 'Map Overlay Code',
    source: 'default_measure',
    editConfig: {
      optionsEndpoint: 'mapOverlays',
      optionLabelKey: 'code',
      optionValueKey: 'id',
      sourceKey: 'default_measure',
    },
  },
  {
    Header: 'Permission Group',
    source: 'permission_groups',
    type: 'jsonTooltip',
    editConfig: {
      optionsEndpoint: 'permissionGroups',
      optionLabelKey: 'name',
      optionValueKey: 'name',
      sourceKey: 'permission_groups',
      allowMultipleValues: true,
    },
  },
  {
    Header: 'Image',
    source: 'image_url',
    type: 'tooltip',
  },
  {
    Header: 'Logo',
    source: 'logo_url',
    type: 'tooltip',
  },
  {
    Header: 'Config',
    source: 'config',
    type: 'jsonTooltip',
    editConfig: {
      type: 'jsonEditor',
    },
    secondaryLabel: 'eg. { "tileSets": "osm,satellite,terrain", "permanentRegionLabels": true }',
  },
  {
    Header: 'Sort',
    source: 'sort_order',
    width: 80,
  },
];

const NEW_PROJECT_COLUMNS = [
  {
    Header: 'Name',
    source: 'name',
  },
  ...FIELDS,

  {
    Header: 'Country Code/s',
    source: 'country.code',
    Filter: ArrayFilter,
    Cell: ({ value }) => prettyArray(value),
    editConfig: {
      optionsEndpoint: 'countries',
      optionLabelKey: 'country.code',
      optionValueKey: 'country.id',
      sourceKey: 'countries',
      allowMultipleValues: true,
    },
  },
  {
    Header: 'Canonical Types (leave blank for default)',
    source: 'entityTypes',
    type: 'tooltip',
    Filter: ArrayFilter,
    Cell: ({ value }) => prettyArray(value),
    editConfig: {
      optionsEndpoint: 'entityTypes',
      optionLabelKey: 'type',
      optionValueKey: 'type',
      pageSize: 1000, // entityTypes endpoint doesn't support filtering, so fetch all values
      allowMultipleValues: true,
    },
  },
];

const EDIT_ONLY_FIELDS = [
  {
    Header: 'Canonical Types',
    source: 'entity_hierarchy.canonical_types',
    width: 140,
    Cell: ({ value }) => prettyArray(value),
    Filter: ArrayFilter,
    editConfig: {
      optionsEndpoint: 'entityTypes',
      optionLabelKey: 'type',
      optionValueKey: 'type',
      sourceKey: 'entity_hierarchy.canonical_types',
      allowMultipleValues: true,
    },
  },
];

const COLUMNS = [
  ...FIELDS,
  ...EDIT_ONLY_FIELDS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      title: 'Edit Project',
      editEndpoint: 'projects',
      fields: [...FIELDS, ...EDIT_ONLY_FIELDS],
    },
  },
];

const CREATE_CONFIG = {
  title: 'Create a new project',
  actionConfig: {
    editEndpoint: PROJECTS_ENDPOINT,
    fields: NEW_PROJECT_COLUMNS,
  },
};

export const ProjectsPage = ({ getHeaderEl }) => (
  <ResourcePage
    title="Projects"
    endpoint="projects"
    columns={COLUMNS}
    getHeaderEl={getHeaderEl}
    createConfig={CREATE_CONFIG}
  />
);

ProjectsPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
