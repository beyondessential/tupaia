/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { ArrayFilter } from '../../table/columnTypes/columnFilters';
import { prettyArray } from '../../utilities';

const RESOURCE_NAME = { singular: 'project' };

const PROJECTS_ENDPOINT = 'projects';

const DEFAULT_FIELDS = [
  {
    Header: 'Description',
    source: 'description',
    required: true,
  },
  {
    Header: 'Dashboard',
    source: 'dashboard_group_name',
    required: true,
    editConfig: {
      optionsEndpoint: 'dashboards',
      optionLabelKey: 'name',
      optionValueKey: 'name',
      sourceKey: 'dashboard_group_name',
      distinct: true,
    },
  },
  {
    Header: 'Map overlay code',
    source: 'default_measure',
    required: true,
    editConfig: {
      optionsEndpoint: 'mapOverlays',
      optionLabelKey: 'code',
      optionValueKey: 'code',
      sourceKey: 'default_measure',
    },
  },
  {
    Header: 'Permission group',
    source: 'permission_groups',
    type: 'jsonTooltip',
    required: true,
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
    required: true,
    editConfig: {
      type: 'image',
      name: 'image_url',
      avatarVariant: 'square',
      labelTooltip: 'Recommended size: 480 × 240 px',
      maxHeight: 240,
      maxWidth: 480,
    },
  },
  {
    Header: 'Logo',
    source: 'logo_url',
    required: true,
    editConfig: {
      type: 'image',
      name: 'logo_url',
      avatarVariant: 'square',
      labelTooltip: 'Recommended size: 480 × 240 px',
      maxHeight: 240,
      maxWidth: 480,
    },
  },
];

const CREATE_FIELDS = [
  {
    Header: 'Code',
    source: 'code',
    required: true,
  },
  ...DEFAULT_FIELDS,
  {
    Header: 'Sort',
    source: 'sort_order',
    width: 80,
  },
];

const EDIT_FIELDS = [
  {
    Header: 'Code',
    source: 'code',
    editable: false,
    required: true,
  },
  ...DEFAULT_FIELDS,
  {
    Header: 'Config',
    source: 'config',
    type: 'jsonTooltip',
    editConfig: {
      type: 'jsonEditor',
      labelTooltip: 'eg. { "tileSets": "osm,satellite,terrain", "permanentRegionLabels": true }',
    },
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
    required: true,
  },
  ...CREATE_FIELDS,
  {
    Header: 'Countries',
    source: 'country.code',
    Filter: ArrayFilter,
    Cell: ({ value }) => prettyArray(value),
    required: true,
    editConfig: {
      optionsEndpoint: 'countries',
      optionLabelKey: 'country.name',
      optionValueKey: 'country.id',
      sourceKey: 'countries',
      pageSize: 'ALL',
      type: 'checkboxList',
    },
  },
  {
    Header: 'Canonical types (leave blank for default)',
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
      title: `Edit ${RESOURCE_NAME.singular}`,
      editEndpoint: 'projects',
      fields: EDIT_FIELDS,
    },
  },
];

const CREATE_CONFIG = {
  actionConfig: {
    editEndpoint: PROJECTS_ENDPOINT,
    fields: NEW_PROJECT_COLUMNS,
  },
};

export const projects = {
  resourceName: RESOURCE_NAME,
  path: '',
  columns: COLUMNS,
  createConfig: CREATE_CONFIG,
  endpoint: PROJECTS_ENDPOINT,
  onProcessDataForSave: (editedFields, recordData) => {
    // If the project is being edited, and the code field is not being edited, then include the existing code in the edited fields so that it can be used for generating project image names.
    if (recordData.code && !editedFields.code) {
      return { ...editedFields, code: recordData.code };
    }
    return editedFields;
  },
  needsBESAdminAccess: ['create'],
};
