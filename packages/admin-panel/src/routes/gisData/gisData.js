import { BES_ADMIN_PERMISSION_GROUP } from '../../utilities/userAccess';

const RESOURCE_NAME = { singular: 'GIS data record', plural: 'GIS data records' };

const ENDPOINT = 'entityPolygons';

const EDIT_FIELDS = [
  { Header: 'Name', source: 'name', required: true },
  { Header: 'Code', source: 'code' },
  { Header: 'Data source', source: 'data_source', required: true },
];

const CREATE_FIELDS = [
  ...EDIT_FIELDS,
  {
    Header: 'Polygon',
    source: 'polygon',
    type: 'jsonTooltip',
    required: true,
    labelTooltip: 'Paste a GeoJSON Polygon or MultiPolygon geometry object.',
    editConfig: {
      type: 'jsonEditor',
      default: '{ "type": "MultiPolygon", "coordinates": [] }',
    },
  },
];

const COLUMNS = [
  { Header: 'Name', source: 'name' },
  { Header: 'Code', source: 'code' },
  { Header: 'Data source', source: 'data_source' },
  {
    Header: 'Linked entities',
    source: 'linked_entity_codes',
    filterable: false,
    sortable: false,
  },
  {
    Header: 'Download',
    type: 'export',
    actionConfig: {
      exportEndpoint: ENDPOINT,
      fileName: '{code}-{data_source}.geojson',
      title: 'Download GeoJSON',
    },
  },
  {
    Header: 'Edit',
    type: 'edit',
    source: 'id',
    actionConfig: {
      title: `Edit ${RESOURCE_NAME.singular}`,
      editEndpoint: ENDPOINT,
      fields: EDIT_FIELDS,
    },
  },
  {
    Header: 'Delete',
    type: 'delete',
    actionConfig: {
      endpoint: ENDPOINT,
    },
  },
];

const CREATE_CONFIG = {
  actionConfig: {
    title: `New ${RESOURCE_NAME.singular}`,
    editEndpoint: ENDPOINT,
    fields: CREATE_FIELDS,
  },
};

const IMPORT_CONFIG = {
  title: `Import ${RESOURCE_NAME.plural}`,
  subtitle: 'Upload a GeoJSON FeatureCollection. Features with an `id` update the matching row; others upsert by (code, data_source).',
  actionConfig: {
    importEndpoint: ENDPOINT,
    accept: {
      'application/geo+json': ['.geojson'],
      'application/json': ['.json'],
    },
  },
};

export const gisData = {
  label: 'GIS Data',
  resourceName: RESOURCE_NAME,
  path: '/gis-data',
  endpoint: ENDPOINT,
  columns: COLUMNS,
  createConfig: CREATE_CONFIG,
  importConfig: IMPORT_CONFIG,
  requiresSomePermissionGroup: [BES_ADMIN_PERMISSION_GROUP],
};
