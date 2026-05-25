import xlsx from 'xlsx';
import { respondWithDownload, toFilename } from '@tupaia/utils';
import { getExportPathForUser } from '@tupaia/server-utils';
import { assertBESAdminAccess } from '../../../permissions';

// Columns the importer reads (see updateCountryEntities.js). Exporting in this
// exact order makes the .xlsx self-describing and round-trippable: a user can
// download, edit, and re-upload without remapping anything.
const COLUMN_ORDER = [
  'name',
  'code',
  'type',
  'country_code',
  'parent_code',
  'attributes',
  'image_url',
  'entity_polygon_id',
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
  data_service_entity: serialiseJsonField(entity.data_service_entity_config ?? null),
});

const fetchCountryEntitiesForProject = async (models, projectId, countryCode) => {
  // Country and World rows are structural; the import sheet for country X
  // already implies the country itself, so we skip both.
  return models.database.executeSql(
    `
      SELECT e.id, e.code, e.name, e.type, e.country_code, e.parent_id,
             e.attributes, e.image_url, e.entity_polygon_id,
             dse.config AS data_service_entity_config
      FROM entity e
      LEFT JOIN data_service_entity dse ON dse.entity_code = e.code
      WHERE e.project_id = ?
        AND e.country_code = ?
        AND e.type NOT IN ('world', 'country', 'project')
      ORDER BY e.code ASC;
    `,
    [projectId, countryCode],
  );
};

export async function exportEntities(req, res) {
  await req.assertPermissions(assertBESAdminAccess);

  const { models, userId } = req;
  const { projectCode } = req.params;

  const project = await models.project.findOne({ code: projectCode });
  if (!project) {
    res.status(400).json({ error: `Unknown projectCode: ${projectCode}` });
    return;
  }

  const projectCountries = await models.database.executeSql(
    `
      SELECT e.code, e.name
      FROM project_country pc
      JOIN entity e ON e.id = pc.country_id
      WHERE pc.project_id = ?
      ORDER BY e.code ASC;
    `,
    [project.id],
  );

  if (projectCountries.length === 0) {
    res.status(400).json({ error: `Project ${projectCode} has no countries to export` });
    return;
  }

  const workbook = xlsx.utils.book_new();

  for (const country of projectCountries) {
    const entities = await fetchCountryEntitiesForProject(models, project.id, country.code);

    // Build a parent_id → code lookup for in-sheet references. Parents may be
    // the country itself (not in `entities`) or another in-sheet entity, so
    // include all known parents from this country plus the country row.
    const parentCodeById = new Map(entities.map(e => [e.id, e.code]));
    const [countryEntity] = await models.database.executeSql(
      'SELECT id, code FROM entity WHERE code = ? AND type = ?;',
      [country.code, 'country'],
    );
    if (countryEntity) parentCodeById.set(countryEntity.id, countryEntity.code);

    const rows = entities.map(entity => buildRow(entity, parentCodeById));
    // Always include the header row, even on empty sheets, so the importer
    // sees a valid schema.
    const sheet = xlsx.utils.json_to_sheet(rows, { header: COLUMN_ORDER });
    xlsx.utils.book_append_sheet(workbook, sheet, country.code);
  }

  const dirname = getExportPathForUser(userId);
  const basename = toFilename(`Entities - ${project.code}.xlsx`);
  const filepath = `${dirname}/${basename}`;
  xlsx.writeFile(workbook, filepath);

  respondWithDownload(res, filepath);
}
