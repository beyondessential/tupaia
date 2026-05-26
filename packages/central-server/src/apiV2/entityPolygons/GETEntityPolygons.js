import { BESAdminGETHandler } from '../GETHandler';

const attachLinkedEntityCodes = async (database, rows) => {
  if (!rows?.length) return rows;
  const ids = rows.map(r => r.id);
  // Use an `IN (...)` clause with one placeholder per id — executeSql's `?`
  // binding doesn't coerce a JS array to a PG array for `ANY(?)`, but binds
  // each placeholder positionally for `IN (?, ?, ...)` cleanly.
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
  const lookup = new Map(linked.map(({ id, linked_entity_codes }) => [id, linked_entity_codes]));
  return rows.map(row => ({ ...row, linked_entity_codes: lookup.get(row.id) ?? null }));
};

const LINKED_CODES_KEY = 'linked_entity_codes';

export class GETEntityPolygons extends BESAdminGETHandler {
  // linked_entity_codes can't be a customColumnSelector — the framework only
  // passes ^CASE / ^to_timestamp through as raw SQL; a subquery selector gets
  // quoted as an identifier and the query fails. Instead we strip
  // linked_entity_codes from the SQL column list, let the stock GET pipeline
  // fetch the row(s), then attach the aggregate in a single follow-up batch
  // query keyed on the page of ids we already have.
  async getProcessedColumns() {
    const columns = await super.getProcessedColumns();
    return columns.filter(spec => !(LINKED_CODES_KEY in spec));
  }

  async findRecords(criteria, options) {
    const rows = await super.findRecords(criteria, options);
    return attachLinkedEntityCodes(this.database, rows);
  }

  async findSingleRecord(recordId, options) {
    const row = await super.findSingleRecord(recordId, options);
    if (!row) return row;
    const [withLinked] = await attachLinkedEntityCodes(this.database, [row]);
    return withLinked;
  }
}
