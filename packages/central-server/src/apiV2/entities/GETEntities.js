import { QUERY_CONJUNCTIONS, JOIN_TYPES } from '@tupaia/database';
import { GETHandler } from '../GETHandler';
import {
  assertAnyPermissions,
  assertBESAdminAccess,
  hasBESAdminAccess,
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
} from '../../permissions';
import { mergeFilter } from '../utilities';
import { assertCountryPermissions } from '../GETCountries';
import { assertEntityPermissions } from './assertEntityPermissions';

const PARENT_CODE_KEY = 'parent_code';
const QUALIFIED_PARENT_CODE_KEY = 'entity.parent_code';
const PARENT_ID_KEY = 'parent_id';

const extractFilterPattern = value => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && typeof value.comparisonValue === 'string') {
    return value.comparisonValue;
  }
  return null;
};

// Resolve parent_code via a single batched follow-up query keyed on the rows
// we already have. Can't do this in SQL: BaseDatabase's column-selector
// allowlist only passes `ST_AsGeoJSON`/`COALESCE`/`TRIM` through as raw SQL
// (everything else gets quoted as an identifier), and the auto-join logic
// doesn't support aliasing the same table twice (entity-as-parent self-join).
const fetchParentCodesByParentId = async (database, parentIds) => {
  const ids = [...new Set(parentIds.filter(Boolean))];
  if (!ids.length) return new Map();
  const placeholders = ids.map(() => '?').join(', ');
  const rows = await database.executeSql(
    `SELECT id, code FROM entity WHERE id IN (${placeholders});`,
    ids,
  );
  return new Map(rows.map(({ id, code }) => [id, code]));
};

export class GETEntities extends GETHandler {
  permissionsFilteredInternally = /** @type {const} */ (true);

  // Join related tables (e.g. `project` for a `project.code` column) with a LEFT
  // join like the other list handlers, so shared entities with a null
  // project_id (countries, world) aren't dropped from the result set.
  defaultJoinType = JOIN_TYPES.LEFT_OUTER;

  getDbQueryCriteria() {
    const criteria = super.getDbQueryCriteria();
    const rawValue =
      criteria[QUALIFIED_PARENT_CODE_KEY] !== undefined
        ? criteria[QUALIFIED_PARENT_CODE_KEY]
        : criteria[PARENT_CODE_KEY];
    if (rawValue === undefined) return criteria;

    const pattern = extractFilterPattern(rawValue);
    if (pattern === null) return criteria;

    const {
      [QUALIFIED_PARENT_CODE_KEY]: _qualified,
      [PARENT_CODE_KEY]: _unqualified,
      ...rest
    } = criteria;
    // Use the pattern as-is — the admin panel already wraps text filters
    // with `%` wildcards, so re-wrapping would produce `%%X%%`.
    return {
      ...rest,
      [QUERY_CONJUNCTIONS.RAW]: {
        sql: 'entity.parent_id IN (SELECT id FROM entity WHERE code ILIKE ?)',
        parameters: [pattern],
      },
    };
  }

  // parent_code is a virtual column — strip it from the SQL select list, but
  // force parent_id into the select if the caller didn't already ask for it,
  // so the post-processor can resolve the lookup.
  async getProcessedColumns() {
    const columns = await super.getProcessedColumns();
    this.parentCodeRequested = columns.some(spec => PARENT_CODE_KEY in spec);
    this.parentIdAlreadyRequested = columns.some(spec => PARENT_ID_KEY in spec);
    const filtered = columns.filter(spec => !(PARENT_CODE_KEY in spec));
    if (!this.parentCodeRequested || this.parentIdAlreadyRequested) return filtered;
    return [...filtered, { [PARENT_ID_KEY]: `${this.recordType}.${PARENT_ID_KEY}` }];
  }

  async findRecords(criteria, options) {
    const rows = await super.findRecords(criteria, options);
    if (!this.parentCodeRequested || !rows?.length) return rows;
    const lookup = await fetchParentCodesByParentId(
      this.database,
      rows.map(r => r.parent_id),
    );
    return rows.map(row => this.attachParentCode(row, lookup));
  }

  async findSingleRecord(entityId, options) {
    const entityPermissionChecker = accessPolicy =>
      assertEntityPermissions(accessPolicy, this.models, entityId);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, entityPermissionChecker]),
    );

    const row = await super.findSingleRecord(entityId, options);
    if (!this.parentCodeRequested || !row) return row;
    const lookup = await fetchParentCodesByParentId(this.database, [row.parent_id]);
    return this.attachParentCode(row, lookup);
  }

  attachParentCode(row, lookup) {
    const parentCode = lookup.get(row.parent_id) ?? null;
    if (this.parentIdAlreadyRequested) {
      return { ...row, [PARENT_CODE_KEY]: parentCode };
    }
    const { parent_id, ...rest } = row;
    return { ...rest, [PARENT_CODE_KEY]: parentCode };
  }

  async getPermissionsFilter(criteria, options) {
    const dbConditions = { ...criteria };

    if (!hasBESAdminAccess(this.accessPolicy)) {
      dbConditions['entity.country_code'] = mergeFilter(
        this.accessPolicy.getEntitiesAllowed(TUPAIA_ADMIN_PANEL_PERMISSION_GROUP),
        dbConditions['entity.country_code'],
      );
    }

    return { dbConditions, dbOptions: options };
  }

  async getPermissionsViaParentFilter(criteria, options) {
    const countryPermissionChecker = accessPolicy =>
      assertCountryPermissions(accessPolicy, this.models, this.parentRecordId);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, countryPermissionChecker]),
    );

    const country = await this.models.country.findById(this.parentRecordId);
    const dbConditions = { 'entity.country_code': country.code, ...criteria };

    return { dbConditions, dbOptions: options };
  }
}
