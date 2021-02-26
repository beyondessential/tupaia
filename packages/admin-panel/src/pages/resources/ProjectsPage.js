/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ResourcePage } from './ResourcePage';

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
    source: 'user_groups',
    type: 'jsonTooltip',
    editConfig: {
      optionsEndpoint: 'permissionGroups',
      optionLabelKey: 'name',
      optionValueKey: 'name',
      sourceKey: 'user_groups',
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

const EDIT_CONFIG = {
  title: 'Edit Project',
};

export const ProjectsPage = ({ getHeaderEl }) => (
  <ResourcePage
    title="Projects"
    endpoint="projects"
    columns={COLUMNS}
    editConfig={EDIT_CONFIG}
    getHeaderEl={getHeaderEl}
  />
);

ProjectsPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
