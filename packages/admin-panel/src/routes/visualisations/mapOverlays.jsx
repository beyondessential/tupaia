import React from 'react';
import { Link } from 'react-router-dom';

import { CreateActionButton } from '../../editor';
import { getPluralForm } from '../../pages/resources/resourceName';
import { ArrayFilter } from '../../table/columnTypes/columnFilters';
import { prettyArray, useHasVizBuilderAccess } from '../../utilities';

const RESOURCE_NAME = { singular: 'map overlay' };

export const MAP_OVERLAYS_ENDPOINT = 'mapOverlays';

const FIELDS = [
  {
    Header: 'Code',
    source: 'code',
    required: true,
  },
  {
    Header: 'Name',
    source: 'name',
    width: 140,
    required: true,
  },
  {
    Header: 'Permission group',
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
    Header: 'Project codes',
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
    Header: 'Legacy',
    source: 'legacy',
    width: 140,
    type: 'boolean',
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
    Header: 'Linked measures',
    source: 'linked_measures',
    Filter: ArrayFilter,
    editConfig: {
      optionsEndpoint: MAP_OVERLAYS_ENDPOINT,
      optionLabelKey: 'id',
      sourceKey: 'linked_measures',
      allowMultipleValues: true,
    },
  },
  {
    Header: 'Entity attributes filters',
    source: 'entity_attributes_filter',
    editConfig: {
      type: 'jsonEditor',
      labelTooltip: (
        <>
          Case-sensitive. This field will be used to filter the entities that this map overlay will
          have data for. It is an extension of <code>config.measureLevel</code>. e.g.&nbsp;
          <code>
            {'{'} "facility_type": "Hospital" {'}'}
          </code>
        </>
      ),
    },
  },
  {
    Header: 'Report code',
    source: 'report_code',
  },
  {
    Header: 'Edit using Visualisation Builder',
    type: 'link',
    editConfig: {
      type: 'link',
      linkOptions: {
        path: '/viz-builder/map-overlay/:id',
        parameters: { id: 'id' },
      },
      needsVizBuilderAccess: true,
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
    type: 'export',
    actionConfig: {
      exportEndpoint: 'mapOverlayVisualisation',
      fileName: '{code}.json',
    },
  },
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      title: `Edit ${RESOURCE_NAME.singular}`,
      editEndpoint: MAP_OVERLAYS_ENDPOINT,
      fields: [...FIELDS, ...extraEditFields],
    },
  },
  {
    Header: 'Delete',
    type: 'delete',
    actionConfig: {
      endpoint: MAP_OVERLAYS_ENDPOINT,
    },
  },
];

const IMPORT_CONFIG = {
  title: `Import ${getPluralForm(RESOURCE_NAME)}`,
  subtitle: 'Please upload one or more JSON files with visualisations to be imported',
  actionConfig: {
    importEndpoint: 'mapOverlayVisualisations',
    multiple: true,
    accept: {
      'application/json': ['.json'],
    },
  },
  getFinishedMessage: response => (
    <>
      <span>{response.message}</span>
      {response.importedVizes.map(({ code, id }) => (
        <p>
          <span>{`${code}: `}</span>
          <Link to={`/viz-builder/map-overlay/${id}`}>View in Visualisation Builder</Link>
        </p>
      ))}
    </>
  ),
};

const LinksComponent = () => {
  const hasVizBuilderAccess = useHasVizBuilderAccess();
  if (!hasVizBuilderAccess) {
    return null;
  }
  return (
    <CreateActionButton to="/viz-builder/map-overlay/new" component={Link}>
      Add map overlay
    </CreateActionButton>
  );
};

export const mapOverlays = {
  resourceName: RESOURCE_NAME,
  path: '/map-overlays',
  endpoint: 'mapOverlays',
  columns: COLUMNS,
  importConfig: IMPORT_CONFIG,
  LinksComponent,
  needsBESAdminAccess: ['delete'],
  needsVizBuilderAccess: ['import'],
};
