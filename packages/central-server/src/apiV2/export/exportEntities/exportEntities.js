import xlsx from 'xlsx';
import { respondWithDownload, toFilename } from '@tupaia/utils';
import { getExportPathForUser } from '@tupaia/server-utils';
import { assertBESAdminAccess } from '../../../permissions';

// Columns the importer reads (see updateCountryEntities.js + resolvePolygonId.js).
// Exporting in this exact order makes the .xlsx self-describing and
// round-trippable: a user can download, edit, and re-upload without remapping.
//
// All three polygon-reference columns are emitted. The importer prefers
// `entity_polygon_id` (rename-stable), falling back to the natural-key pair
// `entity_polygon_code` + `entity_polygon_data_source` (human-readable, useful
// when authoring net-new files where the id isn't known yet).
const COLUMN_ORDER = [
  'name',
  'code',
  'type',
  'country_code',
  'parent_code',
  'attributes',
  'image_url',
  'entity_polygon_id',
  'entity_polygon_code',
  'entity_polygon_data_source',
  'data_service_entity',
];

const serialiseJsonField = value => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
};

const buildRow = (entity, parentCodeById) => ({
  name: entity.name ?? '',
  code: entity.code ?? '',
  type: entity.type ?? '',
  country_code: entity.country_code ?? '',
  parent_code: entity.parent_id ? parentCodeById.get(entity.parent_id) ?? '' : '',
  attributes: serialiseJsonField(entity.attributes),
  image_url: entity.image_url ?? '',
  entity_polygon_id: entity.entity_polygon_id ?? '',
  entity_polygon_code: entity.entity_polygon_code ?? '',
  entity_polygon_data_source: entity.entity_polygon_data_source ?? '',
  data_service_entity: serialiseJsonField(entity.data_service_entity_config ?? null),
});

const fetchProjectEntities = async (models, projectId) =>
  models.database.executeSql(
    `
      SELECT e.id, e.code, e.name, e.type, e.country_code, e.parent_id,
             e.attributes, e.image_url, e.entity_polygon_id,
             ep.code AS entity_polygon_code,
             ep.data_source AS entity_polygon_data_source,
             dse.config AS data_service_entity_config
      FROM entity e
      LEFT JOIN entity_polygon ep ON ep.id = e.entity_polygon_id
      LEFT JOIN data_service_entity dse ON dse.entity_code = e.code
      WHERE e.project_id = ?
        AND e.type NOT IN ('world', 'country', 'project')
      ORDER BY e.country_code ASC, e.code ASC;
    `,
    [projectId],
  );

const fetchCountryParentLookup = async (models, projectId) =>
  models.database.executeSql(
    `
      SELECT e.id, e.code
      FROM entity e
      JOIN project_country pc ON pc.country_id = e.id
      WHERE pc.project_id = ? AND e.type = 'country';
    `,
    [projectId],
  );

export async function exportEntities(req, res) {
  await req.assertPermissions(assertBESAdminAccess);

  const { models, userId } = req;
  const { projectCode } = req.params;

  const project = await models.project.findOne({ code: projectCode });
  if (!project) {
    res.status(400).json({ error: `Unknown projectCode: ${projectCode}` });
    return;
  }

  const entities = await fetchProjectEntities(models, project.id);

  // Build a parent_id → code lookup that covers both in-sheet entities and
  // the project's country rows (which the import sheet doesn't contain, but
  // are valid parents for the first level of sub-national entities).
  const parentCodeById = new Map(entities.map(e => [e.id, e.code]));
  const countryEntities = await fetchCountryParentLookup(models, project.id);
  for (const country of countryEntities) {
    parentCodeById.set(country.id, country.code);
  }

  const rows = entities.map(entity => buildRow(entity, parentCodeById));
  const sheet = xlsx.utils.json_to_sheet(rows, { header: COLUMN_ORDER });

  const workbook = xlsx.utils.book_new();
  // Single sheet per project (TUP-3061). Sheet name is informational; the
  // importer doesn't read it.
  xlsx.utils.book_append_sheet(workbook, sheet, 'Entities');

  const dirname = getExportPathForUser(userId);
  const basename = toFilename(`Entities - ${project.code}.xlsx`);
  const filepath = `${dirname}/${basename}`;
  xlsx.writeFile(workbook, filepath);

  respondWithDownload(res, filepath);
}
