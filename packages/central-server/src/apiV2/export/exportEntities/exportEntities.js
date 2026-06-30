import xlsx from 'xlsx';
import { respondWithDownload, toFilename } from '@tupaia/utils';
import { getExportPathForUser } from '@tupaia/server-utils';
import { getAdminPanelAllowedCountryCodes } from '../../utilities';
import { BES_ADMIN_PERMISSION_GROUP } from '../../../permissions';

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
  // The importer reads this column as `entity_type` (getEntityObjectValidator +
  // updateCountryEntities), so emit that header — not the raw db column `type`
  // — or the round-trip fails validation with "entity_type … got undefined".
  'entity_type',
  'country_code',
  'parent_code',
  // Point location, latitude-first per the usual lat/long convention. The
  // importer reads them by header name (order-independent) and rebuilds
  // entity.point (and derives bounds); entities located only via a polygon link
  // leave these blank and round-trip through entity_polygon_id instead.
  'latitude',
  'longitude',
  'attributes',
  'image_url',
  'entity_polygon_id',
  'entity_polygon_code',
  'entity_polygon_data_source',
  'data_service_entity',
];

// Serialise a flat attribute object to newline-separated `key: value` lines —
// the human-friendly reference-data format the importer reads back (see
// extractEntitiesFromUpload.js). attributes/data_service_entity are flat scalar
// objects; an empty object exports as a blank cell.
const serialiseKeyValueField = value => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value; // defensive: already serialised
  return Object.entries(value)
    .map(([key, val]) => `${key}: ${val}`)
    .join('\n');
};

const buildRow = (entity, parentCodeById) => ({
  name: entity.name ?? '',
  code: entity.code ?? '',
  entity_type: entity.type ?? '',
  country_code: entity.country_code ?? '',
  parent_code: entity.parent_id ? parentCodeById.get(entity.parent_id) ?? '' : '',
  longitude: entity.longitude ?? '',
  latitude: entity.latitude ?? '',
  attributes: serialiseKeyValueField(entity.attributes),
  image_url: entity.image_url ?? '',
  entity_polygon_id: entity.entity_polygon_id ?? '',
  entity_polygon_code: entity.entity_polygon_code ?? '',
  entity_polygon_data_source: entity.entity_polygon_data_source ?? '',
  data_service_entity: serialiseKeyValueField(entity.data_service_entity_config ?? null),
});

// Columns selected for each export row. Shared between the two branches of the
// UNION below so they line up.
const ENTITY_COLUMNS = `
  e.id, e.code, e.name, e.type, e.country_code, e.parent_id,
  e.attributes, e.image_url, e.entity_polygon_id,
  ST_X(e.point::geometry) AS longitude,
  ST_Y(e.point::geometry) AS latitude,
  ep.code AS entity_polygon_code,
  ep.data_source AS entity_polygon_data_source,
  dse.config AS data_service_entity_config
`;
const ENTITY_JOINS = `
  LEFT JOIN entity_polygon ep ON ep.id = e.entity_polygon_id
  LEFT JOIN data_service_entity dse ON dse.entity_code = e.code
`;

const fetchProjectEntities = async (models, projectId, allowedCountryCodes) =>
  models.database.executeSql(
    `
      -- Sub-country entities scoped to this project.
      SELECT ${ENTITY_COLUMNS}
      FROM entity e
      ${ENTITY_JOINS}
      WHERE e.project_id = ?
        -- Scope to the countries the requesting user has Tupaia Admin Panel
        -- access to — matches the baseline export's permission behaviour.
        AND e.country_code = ANY(?)
        AND e.type NOT IN ('world', 'country', 'project')
        -- Only export entities whose country is actually part of the project
        -- (project_country). entity.project_id alone over-includes the orphaned
        -- sub-country entities parked in the explore project (see entity
        -- duplication migration), whose countries have no project_country row.
        -- The importer validates country_code against this same project_country
        -- set, so anything outside it can't round-trip — exclude it here.
        AND EXISTS (
          SELECT 1
          FROM project_country pc
          JOIN entity c ON c.id = pc.country_id
          WHERE pc.project_id = e.project_id
            AND c.code = e.country_code
        )
      UNION ALL
      -- The project's shared country entities (project_id IS NULL), via the
      -- project_country bridge, so a multi-country project's export is complete.
      -- On re-import these are skipped — countries are shared and managed via
      -- the Countries tab, not created per-project.
      SELECT ${ENTITY_COLUMNS}
      FROM entity e
      ${ENTITY_JOINS}
      JOIN project_country pc ON pc.country_id = e.id AND pc.project_id = ?
      WHERE e.type = 'country'
        AND e.code = ANY(?);
    `,
    [projectId, allowedCountryCodes, projectId, allowedCountryCodes],
  );

// Order entities by generational distance from their country (countries first,
// then each level down the tree), with an alphabetical-by-code secondary sort
// within a level. Mirrors the baseline hierarchy export's breadth-first order.
// Depth is walked up the parent_id chain within the result set, which always
// contains every ancestor up to the country.
const orderByGeneration = entities => {
  const byId = new Map(entities.map(entity => [entity.id, entity]));
  const depthOf = entity => {
    let depth = 0;
    let current = entity;
    const visited = new Set();
    while (
      current &&
      current.type !== 'country' &&
      current.parent_id &&
      byId.has(current.parent_id) &&
      !visited.has(current.id)
    ) {
      visited.add(current.id);
      depth += 1;
      current = byId.get(current.parent_id);
    }
    return depth;
  };

  return entities
    .map(entity => ({ entity, depth: depthOf(entity) }))
    .sort((a, b) => a.depth - b.depth || (a.entity.code ?? '').localeCompare(b.entity.code ?? ''))
    .map(({ entity }) => entity);
};

export async function exportEntities(req, res) {
  const { models, userId, accessPolicy } = req;
  const { projectCode } = req.params;

  // Match baseline: a user can export without BES Admin, scoped to the countries
  // they have Tupaia Admin Panel access to (throws if they have none). BES
  // admins aren't enumerated against that permission group, so they're scoped
  // to every country in the project instead (below). assertPermissions also
  // flags the permission check for the ensurePermissionCheck sentinel.
  const isBESAdmin = accessPolicy.allowsSome(undefined, BES_ADMIN_PERMISSION_GROUP);
  await req.assertPermissions(policy => {
    if (!isBESAdmin) getAdminPanelAllowedCountryCodes(policy);
  });

  const project = await models.project.findOne({ code: projectCode });
  if (!project) {
    res.status(400).json({ error: `Unknown projectCode: ${projectCode}` });
    return;
  }

  const allowedCountryCodes = isBESAdmin
    ? (await project.countries()).map(country => country.code)
    : getAdminPanelAllowedCountryCodes(accessPolicy);

  const entities = await fetchProjectEntities(models, project.id, allowedCountryCodes);

  // The UNION in fetchProjectEntities already returns the project's country
  // entities, so a code lookup built from `entities` covers every parent_id a
  // sub-national row can reference (its country, or an ancestor in the same
  // in-scope country).
  const parentCodeById = new Map(entities.map(e => [e.id, e.code]));

  // Countries hang off World, which the export set omits — add it so country
  // rows show their parent code (matching the entities tab) rather than blank.
  const world = await models.entity.findOne({ type: models.entity.types.WORLD });
  if (world) parentCodeById.set(world.id, world.code);

  const rows = orderByGeneration(entities).map(entity => buildRow(entity, parentCodeById));
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
