import { GETHandler } from '../GETHandler';
import { assertAdminPanelAccess, assertAnyPermissions, assertBESAdminAccess } from '../../permissions';

const fetchLinkedCodesByPolygonId = async (database, ids) => {
  if (!ids.length) return new Map();
  const placeholders = ids.map(() => '?').join(', ');
  const linked = await database.executeSql(
    `
      SELECT entity_polygon_id AS id, STRING_AGG(code, ', ' ORDER BY code) AS linked_entity_codes
      FROM entity
      WHERE entity_polygon_id IN (${placeholders})
      GROUP BY entity_polygon_id;
    `,
    ids,
  );
  return new Map(linked.map(({ id, linked_entity_codes }) => [id, linked_entity_codes]));
};

const LINKED_CODES_KEY = 'linked_entity_codes';
const ID_KEY = 'id';

export class GETEntityPolygons extends GETHandler {
  // Polygons are shared reference geometry (not country-scoped). Creating,
  // editing, deleting and importing them stays BES-admin-only, but any admin
  // panel user can read the list — the entity edit modal's GIS-polygon picker
  // needs it, and those users are already allowed to set an entity's polygon
  // link.
  async assertUserHasAccess() {
    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, assertAdminPanelAccess]));
  }

  // linked_entity_codes can't be a customColumnSelector — the framework only
  // passes ^CASE / ^to_timestamp through as raw SQL; a subquery selector gets
  // quoted as an identifier and the query fails. Instead we strip
  // linked_entity_codes from the SQL column list, let the stock GET pipeline
  // fetch the row(s), then attach the aggregate in a single follow-up batch
  // query keyed on the polygon ids we already have.
  async getProcessedColumns() {
    const columns = await super.getProcessedColumns();
    // Track whether the caller actually requested `id`. We force it into the
    // SQL select so we can key the linked-codes lookup, then strip it back
    // out below if it wasn't requested.
    this.idColumnRequested = columns.some(spec => ID_KEY in spec);
    const filtered = columns.filter(spec => !(LINKED_CODES_KEY in spec));
    if (this.idColumnRequested) return filtered;
    return [...filtered, { [ID_KEY]: `${this.recordType}.${ID_KEY}` }];
  }

  async findRecords(criteria, options) {
    const rows = await super.findRecords(criteria, options);
    if (!rows?.length) return rows;
    const lookup = await fetchLinkedCodesByPolygonId(
      this.database,
      rows.map(r => r.id),
    );
    return rows.map(row => {
      const linkedCode = lookup.get(row.id) ?? null;
      if (this.idColumnRequested) {
        return { ...row, linked_entity_codes: linkedCode };
      }
      const { id, ...rest } = row;
      return { ...rest, linked_entity_codes: linkedCode };
    });
  }

  async findSingleRecord(recordId, options) {
    const row = await super.findSingleRecord(recordId, options);
    if (!row) return row;
    const lookup = await fetchLinkedCodesByPolygonId(this.database, [recordId]);
    const linkedCode = lookup.get(recordId) ?? null;
    if (this.idColumnRequested) {
      return { ...row, linked_entity_codes: linkedCode };
    }
    const { id, ...rest } = row;
    return { ...rest, linked_entity_codes: linkedCode };
  }
}
