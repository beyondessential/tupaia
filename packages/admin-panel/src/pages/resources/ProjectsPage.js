/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ResourcePage } from './ResourcePage';

const PROJECTS_ENDPOINT = 'projects';

export const NEW_PROJECT_COLUMNS = [
  {
    Header: 'Country code/s',
    source: 'country.code',
    editConfig: {
      optionsEndpoint: 'countries',
      optionLabelKey: 'country.code',
      optionValueKey: 'country.id',
      sourceKey: 'country_id',
    },
  },
  {
    Header: 'Project code',
    source: 'project_code',
  },
  {
    Header: 'Project name',
    source: 'Description',
  },
  {
    Header: 'Logo image url',
    source: 'logo_image',
  },
  {
    Header: 'Background image url',
    source: 'logo_image',
  },
  {
    Header: 'Sort Order',
    source: 'sort_order',
  },
];

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
      optionsEndpoint: 'dashboardGroups',
      optionLabelKey: 'name',
      optionValueKey: 'name',
      sourceKey: 'dashboard_group_name',
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
    editConfig: { type: 'jsonEditor' },
    secondaryLabel: 'eg. { "tileSets": "osm,satellite,terrain", "permanentRegionLabels": true }',
  },
  {
    Header: 'Sort',
    source: 'sort_order',
    width: 80,
  },
];

const COLUMNS = [
  ...FIELDS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      editEndpoint: 'projects',
      fields: FIELDS,
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

const EDIT_CONFIG = {
  title: 'Edit Project',
};

export const ProjectsPage = ({ getHeaderEl }) => (
  <ResourcePage
    title="Projects"
    endpoint={PROJECTS_ENDPOINT}
    columns={COLUMNS}
    editConfig={EDIT_CONFIG}
    createConfig={CREATE_CONFIG}
    getHeaderEl={getHeaderEl}
  />
);

ProjectsPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
