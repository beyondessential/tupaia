import React from 'react';
import { Link } from 'react-router-dom';
import { CreateActionButton } from '../../editor';
import { useUser } from '../../api/queries';

const RESOURCE_NAME = { singular: 'dashboard item' };

export const DASHBOARD_ITEMS_ENDPOINT = 'dashboardItems';

const FIELDS = [
  {
    Header: 'Code',
    source: 'code',
    required: true,
  },
  {
    Header: 'Report code',
    source: 'report_code',
    required: true,
  },
  {
    Header: 'Config',
    source: 'config',
    type: 'jsonTooltip',
    editConfig: { type: 'jsonEditor' },
  },
  {
    Header: 'Legacy',
    source: 'legacy',
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
    Header: 'Edit using Visualisation Builder',
    type: 'link',
    editConfig: {
      type: 'link',
      linkOptions: {
        path: '/viz-builder/dashboard-item/:id',
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
      exportEndpoint: 'dashboardVisualisation',
      fileName: '{code}.json',
    },
  },
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      title: `Edit ${RESOURCE_NAME.singular}`,
      editEndpoint: DASHBOARD_ITEMS_ENDPOINT,
      fields: [...FIELDS, ...extraEditFields],
    },
  },
  {
    Header: 'Delete',
    type: 'delete',
    actionConfig: {
      endpoint: DASHBOARD_ITEMS_ENDPOINT,
    },
  },
];

const IMPORT_CONFIG = {
  title: `Import ${RESOURCE_NAME.singular}s`,
  subtitle: 'Please upload one or more JSON files with visualisations to be imported',
  actionConfig: {
    importEndpoint: 'dashboardVisualisations',
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
          <Link to={`/viz-builder/dashboard-item/${id}`}>View in Visualisation Builder</Link>
        </p>
      ))}
    </>
  ),
};

const LinksComponent = () => {
  const { hasVizBuilderAccess } = useUser();
  if (!hasVizBuilderAccess) {
    return null;
  }

  return (
    <CreateActionButton to="/viz-builder/dashboard-item/new" component={Link}>
      Add dashboard item
    </CreateActionButton>
  );
};

export const dashboardItems = {
  resourceName: RESOURCE_NAME,
  path: '',
  default: true,
  endpoint: DASHBOARD_ITEMS_ENDPOINT,
  importConfig: IMPORT_CONFIG,
  columns: COLUMNS,
  LinksComponent,
  needsBESAdminAccess: ['delete'],
  needsVizBuilderAccess: ['import'],
};
