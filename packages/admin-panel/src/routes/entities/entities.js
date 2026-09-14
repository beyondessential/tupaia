import { SURVEY_RESPONSE_COLUMNS } from '../surveys/surveyResponses';
import { getPluralForm } from '../../pages/resources/resourceName';
import { EntitiesExportModal } from '../../importExport';

const RESOURCE_NAME = { singular: 'entity', plural: 'entities' };

const ENTITIES_ENDPOINT = 'entities';

// Polygons can share a code across data sources, so show all three parts for a
// readable, unambiguous label. Code is optional, so fall back to name + source.
const formatPolygonLabel = polygon => {
  if (!polygon?.name) return '';
  const { name, code, data_source: dataSource } = polygon;
  return code ? `${name} — ${code} (${dataSource})` : `${name} (${dataSource})`;
};

const getRowPolygon = row => ({
  name: row['entity_polygon.name'],
  code: row['entity_polygon.code'],
  data_source: row['entity_polygon.data_source'],
});

export const FIELDS = {
  id: { source: 'id', show: false },
  code: {
    Header: 'Code',
    source: 'code',
    required: true,
  },
  name: {
    Header: 'Name',
    source: 'name',
    required: true,
  },
  type: {
    Header: 'Type',
    source: 'type',
    required: true,
  },
  attributes: {
    Header: 'Attributes',
    source: 'attributes',
    type: 'jsonTooltip',
    editConfig: {
      type: 'jsonEditor',
    },
  },
  entity_polygon_id: {
    Header: 'GIS polygon',
    source: 'entity_polygon_id',
    accessor: row => formatPolygonLabel(getRowPolygon(row)),
    editConfig: {
      optionsEndpoint: 'entityPolygons',
      optionLabelKey: 'name',
      optionValueKey: 'id',
      optionFields: ['id', 'name', 'code', 'data_source'],
      renderOption: formatPolygonLabel,
      sourceKey: 'entity_polygon_id',
      // Show the linked polygon's readable label rather than its id. The picker
      // still submits the polygon id; this only affects what's displayed.
      accessor: record => formatPolygonLabel(getRowPolygon(record)),
      // Polygons aren't project-scoped (reference data), so the picker shows
      // all polygons regardless of the active project. Use the GIS Data page
      // to create a new polygon before linking it here.
    },
  },
};

// Hidden columns so the joined polygon fields are fetched for the label above.
const GIS_POLYGON_FIELDS = [
  { source: 'entity_polygon.name', show: false },
  { source: 'entity_polygon.code', show: false },
  { source: 'entity_polygon.data_source', show: false },
];

export const QRCodeColumn = {
  Header: 'QR',
  type: 'qrCode',
  actionConfig: {
    qrCodeContentsKey: 'id',
    humanReadableIdKey: 'name',
    qrCodePrefix: 'entity-', // TODO: Consolidate id prefixing into a common util (RN-968)
  },
};

export const COLUMNS = [
  ...Object.values(FIELDS),
  ...GIS_POLYGON_FIELDS,
  {
    Header: 'Country',
    source: 'country_code',
  },
  {
    Header: 'Parent code',
    source: 'parent_code',
    sortable: false,
  },
  {
    Header: 'Project',
    source: 'project.code',
  },
  {
    Header: 'Edit',
    type: 'edit',
    actionConfig: {
      editEndpoint: ENTITIES_ENDPOINT,
      title: `Edit ${RESOURCE_NAME.singular}`,
      // GIS_POLYGON_FIELDS are hidden; they're only fetched so the polygon
      // picker can show the linked polygon's readable label.
      fields: [FIELDS.name, FIELDS.attributes, FIELDS.entity_polygon_id, ...GIS_POLYGON_FIELDS],
    },
  },
  {
    Header: 'Delete',
    type: 'delete',
    actionConfig: {
      endpoint: ENTITIES_ENDPOINT,
    },
  },
  QRCodeColumn,
];

const IMPORT_CONFIG = {
  title: `Import ${getPluralForm(RESOURCE_NAME)}`,
  subtitle:
    'Please note that if this is the first time a country is being imported, you will need to restart central-server post-import for it to sync to DHIS2.', // hope to fix one day in https://github.com/beyondessential/central-server/issues/481
  actionConfig: {
    importEndpoint: ENTITIES_ENDPOINT,
    extraQueryParameters: {
      // If a large import doesn't finish in 30s, respond and email the result
      // rather than holding the request open until it times out. 30s gives a
      // big project's skip-unchanged pass (parse + snapshot) room to finish
      // synchronously.
      respondWithEmailTimeout: 30 * 1000,
    },
    accept: {
      'application/geo+json': ['.geojson'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
  },
  queryParameters: [
    {
      label: 'Push new entities to DHIS2 server',
      parameterKey: 'pushToDhis',
      type: 'boolean',
      editConfig: {
        type: 'boolean',
      },
    },
  ],
  getFinishedMessage: response => {
    const warnings = response.warnings ?? [];
    return warnings.length
      ? `Your import has been successfully processed. ${warnings.join(' ')}`
      : 'Your import has been successfully processed';
  },
};

export const entities = {
  resourceName: RESOURCE_NAME,
  path: '',
  default: true,
  endpoint: ENTITIES_ENDPOINT,
  columns: COLUMNS,
  importConfig: IMPORT_CONFIG,
  ExportModalComponent: EntitiesExportModal,
  nestedViews: [
    {
      title: 'Survey responses',
      endpoint: `${ENTITIES_ENDPOINT}/{id}/surveyResponses`,
      columns: SURVEY_RESPONSE_COLUMNS,
      path: '/:id/surveyResponses',
      displayProperty: 'name',
      getNestedViewLink: ({ id }) => `/surveys/survey-responses/${id}/answers`,
    },
  ],
};
