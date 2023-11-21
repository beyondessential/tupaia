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

const DEFAULT_FIELDS = [
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
      distinct: true,
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
    editConfig: {
      type: 'image',
      name: 'image_url',
      avatarVariant: 'square',
      deleteModal: {
        title: 'Remove Project Image',
        message: 'Are you sure you want to delete your image?',
      },
      secondaryLabel: 'Recommended size: 480x240px',
      maxHeight: 240,
      maxWidth: 480,
    },
  },
  {
    Header: 'Logo',
    source: 'logo_url',
    editConfig: {
      type: 'image',
      name: 'logo_url',
      avatarVariant: 'square',
      deleteModal: {
        title: 'Remove Project Logo',
        message: 'Are you sure you want to delete your image?',
      },
      secondaryLabel: 'Recommended size: 480x240px',
      maxHeight: 240,
      maxWidth: 480,
    },
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

const CREATE_FIELDS = [
  {
    Header: 'Code',
    source: 'code',
  },
  ...DEFAULT_FIELDS,
];

const EDIT_FIELDS = [
  {
    Header: 'Code',
    source: 'code',
    editable: false,
  },
  ...DEFAULT_FIELDS,
];

const NEW_PROJECT_COLUMNS = [
  {
    Header: 'Name',
    source: 'name',
  },
  ...CREATE_FIELDS,
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

const COLUMNS = [
  ...EDIT_FIELDS,
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      title: 'Edit Project',
      editEndpoint: 'projects',
      fields: EDIT_FIELDS,
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
    onProcessDataForSave={(editedFields, recordData) => {
      // If the project is being edited, and the code field is not being edited, then include the existing code in the edited fields so that it can be used for generating project image names.
      if (recordData.code && !editedFields.code) {
        return { ...editedFields, code: recordData.code };
      }
      return editedFields;
    }}
  />
);

ProjectsPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
