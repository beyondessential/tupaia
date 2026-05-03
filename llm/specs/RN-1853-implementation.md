# RN-1853 — Implementation plan

[Linear ticket](https://linear.app/bes/issue/RN-1853/add-project-id-to-entities-and-duplicate-shared-entities-per-project) · [Spec](./RN-1853-refinement.md)

This document is a self-contained implementation plan. Read the spec for *what* and *why*; this document covers *how*.

### Brancing Strategy	

- Use existing branch named `rn-1853-migrate-entities-to-projects` 

- Aim PRs to `epic-entity-hierarchy` 

---

## File inventory

### New

- `packages/database/src/core/migrations/<timestamp>-addProjectIdToEntity-modifies-schema.js` — DDL only: add column + index, drop dashboard FK + entity_code_key, add UNIQUE(code, project_id).
- `packages/database/src/core/migrations/<timestamp+1>-backfillProjectIdsAndDuplicateSharedEntities-modifies-data.js` — DML and the data-dependent CHECK constraint (refactored into per-step helper functions). Suffix `-modifies-data.js` means it is skipped by `setupNewDatabase.sh`, so test DBs never get the CHECK and dummy-entity fixtures keep working.

### Modified

- `packages/database/src/core/modelClasses/Entity.js` — `excludedFieldsFromSync` (no change — `project_id` not added to list), update `customColumnSelectors` if needed
- `packages/database/src/server/changeHandlers/entityHierarchyCacher/EntityParentChildRelationBuilder.js` — thread `project.id` into `getRelationsViaCanonical`, add `project_id` filter
- `packages/types/src/types/models.ts` — regenerated; `entity.project_id` becomes part of the `Entity` interface
- `packages/types/src/schemas/schemas.ts` — regenerated
- Dashboard render path (file TBD during implementation — likely in `tupaia-web-server` or `web-config-server`) — update `dashboard.root_entity_code` resolver to include `project_id` filter

### Verify (audit only, no expected changes for this ticket)

- `packages/database/src/core/sync/buildSyncLookupSelect.js` — confirm `project_id` flows through
- `packages/meditrak-app-server/src/sync/appSupportedModels.ts` — confirm `project_id` is **not** in `unsupportedFields`
- `packages/central-server/src/database/models/Entity.js` — confirm `project_id` is **not** in `meditrakConfig.ignorableFields`

---

## Phase 1: Schema migration scaffold

Create two migration files: `yarn migrate-create addProjectIdToEntity` (schema, ends `-modifies-schema.js`) followed by `yarn migrate-create backfillProjectIdsAndDuplicateSharedEntities --type data` (data, ends `-modifies-data.js`). The schema file runs first; the data file runs after and applies the CHECK constraint at the end.

Migration structure (high level — concrete SQL fleshed out in the file itself):

```js
exports.up = async function (db) {
  // 1. Add nullable project_id column with FK to project(id), ON DELETE RESTRICT
  // 2. Add index on entity(project_id)
  // 3. Backfill (Phase 2)
  // 4. Add UNIQUE (code, project_id)
  // 5. Add CHECK constraint
};

exports.down = async function (db) {
  // 1. Drop CHECK constraint
  // 2. Drop UNIQUE constraint
  // 3. Delete duplicated entity rows (those whose project_id was assigned during this migration)
  // 4. Unset project_id on remaining rows
  // 5. Drop index
  // 6. Drop column
};
```

The down migration is awkward but worth attempting (we should be able to identify duplicates by some marker — see Phase 2.5).

---

## Phase 2: Data migration (inside `up`)

### 2.1 Setup

- Look up explore project ID once: `SELECT id FROM project WHERE code = 'explore'` — fail-fast if not present.
- Generate timestamp/marker for the migration run (used for rollback identification).

### 2.2 Backfill `project_id` for sub-country entities — single-project case

For sub-country entities that appear in exactly one project's hierarchy, just set `project_id`:

```sql
UPDATE entity
SET project_id = sub.project_id
FROM (
  SELECT entity.id AS entity_id, MIN(p.id) AS project_id
  FROM entity
  JOIN entity_parent_child_relation epcr ON entity.id = epcr.child_id
  JOIN project p ON p.entity_hierarchy_id = epcr.entity_hierarchy_id
  WHERE entity.type NOT IN ('world', 'project', 'country')
  GROUP BY entity.id
  HAVING count(DISTINCT p.id) = 1
) sub
WHERE entity.id = sub.entity_id;
```

### 2.3 Duplicate sub-country entities for multi-project case

For sub-country entities that appear in 2+ projects, the original row gets one `project_id` (lowest by ID for determinism) and N-1 copies are inserted. Pseudocode:

```js
// For each multi-project entity, find its set of projects
const multiProjectEntities = await db.runSql(`
  SELECT entity.id, array_agg(DISTINCT p.id ORDER BY p.id) AS project_ids
  FROM entity
  JOIN entity_parent_child_relation epcr ON entity.id = epcr.child_id
  JOIN project p ON p.entity_hierarchy_id = epcr.entity_hierarchy_id
  WHERE entity.type NOT IN ('world', 'project', 'country')
  GROUP BY entity.id
  HAVING count(DISTINCT p.id) > 1;
`);

for (const row of multiProjectEntities.rows) {
  const [firstProject, ...restProjects] = row.project_ids;
  // Original row keeps the first project
  await db.runSql(`UPDATE entity SET project_id = $1 WHERE id = $2;`, [firstProject, row.id]);
  // N-1 copies for the rest
  for (const projectId of restProjects) {
    const newId = generateId();
    await db.runSql(`
      INSERT INTO entity (id, code, parent_id, name, type, image_url, country_code, point, bounds, metadata, attributes, entity_polygon_id, project_id)
      SELECT $1, code, parent_id, name, type, image_url, country_code, point, bounds, metadata, attributes, entity_polygon_id, $2
      FROM entity WHERE id = $3;
    `, [newId, projectId, row.id]);
  }
}
```

Performance note: this inserts ~104k rows. If this is too slow per-row, batch the INSERTs using `INSERT ... SELECT ... FROM (VALUES (...)) AS m(entity_id, polygon_id)` (similar to the RN-1851 migration approach). Decide during rehearsal.

### 2.4 Backfill orphans (entities with no project mapping)

```sql
UPDATE entity
SET project_id = $1, -- explore project ID
    metadata = jsonb_set(
      COALESCE(metadata, '{}'::jsonb),
      '{orphaned}',
      'true'::jsonb
    )
WHERE type NOT IN ('world', 'project', 'country')
  AND project_id IS NULL;
```

### 2.5 Repoint child tables

For each entity-id-linked table, repoint `entity_id` to the per-project copy. Pattern:

```sql
-- survey_response: lookup project via survey
UPDATE survey_response sr
SET entity_id = target.id
FROM survey s
JOIN entity original ON original.id = sr.entity_id
JOIN entity target ON target.code = original.code AND target.project_id = s.project_id
WHERE sr.survey_id = s.id
  AND original.type NOT IN ('world', 'project', 'country')
  AND target.id <> original.id; -- only update where there's a different copy to point at
```

Apply equivalent updates for:
- `survey_response_draft.entity_id` (lookup via `survey.project_id`)
- `task.entity_id` (lookup via `task.survey_id → survey.project_id` if survey-tied; otherwise audit)
- Any other `entity_id` FK uncovered during implementation (audit during rehearsal)

For `survey_response` anomalies (44 rows where survey's project not in entity's hierarchy):

```sql
-- Repoint anomalies to explore-project copy of the entity, mark for audit
UPDATE survey_response sr
SET entity_id = explore_copy.id,
    metadata = jsonb_set(
      COALESCE(sr.metadata, '{}'::jsonb),
      '{migrated_from_orphan_response}',
      'true'::jsonb
    )
FROM entity original
JOIN entity explore_copy ON explore_copy.code = original.code AND explore_copy.project_id = $1 -- explore project ID
WHERE sr.entity_id = original.id
  AND original.type NOT IN ('world', 'project', 'country')
  AND NOT EXISTS (
    SELECT 1 FROM survey s
    JOIN entity target ON target.code = original.code AND target.project_id = s.project_id
    WHERE s.id = sr.survey_id AND target.id <> original.id
  );
```

(Refine during implementation — exact subquery depends on how step 2.5's main update interacts with the anomaly cases.)

### 2.6 Cleanup of erroneous project-pointing rows

```sql
DELETE FROM user_entity_permission WHERE id IN (
  '5fa0cb6361f76a679a05c822',
  '5fb37ce361f76a7cdf03b81f'
);

DELETE FROM access_request WHERE id = '5f9f54c461f76a679a048105';
```

### 2.7 Apply constraints

Once all rows have valid `project_id` per the rule (sub-country = NOT NULL, structural types = NULL):

```sql
ALTER TABLE entity ADD CONSTRAINT entity_project_id_check
  CHECK (
    (type IN ('world', 'project', 'country') AND project_id IS NULL)
    OR project_id IS NOT NULL
  );

ALTER TABLE entity ADD CONSTRAINT entity_code_project_id_unique
  UNIQUE (code, project_id);
```

---

## Phase 3: Code changes

### 3.1 `EntityParentChildRelationBuilder.getRelationsViaCanonical`

Path: `packages/database/src/server/changeHandlers/entityHierarchyCacher/EntityParentChildRelationBuilder.js`

Change: thread `project` (already in scope at `rebuildRelationsForEntity`) down through `fetchAndCacheChildren → getRelationsViaCanonical`, and add `project_id: project.id` to the `entity.find` criteria.

Diff sketch:

```js
async fetchAndCacheChildren(hierarchyId, parentIds, project, childrenAlreadyCached = new Set(), relatedEntityIds = new Set()) {
  // ... existing logic ...
  const entityParentChildRelations = hasEntityRelationLinks
    ? await this.getRelationsViaEntityRelation(hierarchyId, parentIds, childrenAlreadyCached)
    : await this.getRelationsViaCanonical(hierarchyId, parentIds, project, childrenAlreadyCached);
  // ...
  return this.fetchAndCacheChildren(hierarchyId, validChildIds, project, latestChildrenAlreadyCached, latestRelatedEntityIds);
}

async getRelationsViaCanonical(hierarchyId, parentIds, project, childrenAlreadyCached = new Set()) {
  // ...
  const entities = await this.models.entity.find({
    parent_id: parentIds,
    type: canonicalTypes,
    project_id: project.id, // NEW: scope to current project
  });
  // ...
}
```

Update the call site in `rebuildRelationsForEntity` to pass `project` to `fetchAndCacheChildren`.

### 3.2 Dashboard `root_entity_code` resolver

The render path that resolves `dashboard.root_entity_code` to an entity row needs a project filter. Find the resolver site (likely in `tupaia-web-server` or `web-config-server`) and update:

```js
// Before
const rootEntity = await models.entity.findOne({ code: dashboard.root_entity_code });

// After
const rootEntity = await models.entity.findOne({
  code: dashboard.root_entity_code,
  // Match either the current project's copy OR the structural shared row
  ['$or']: [
    { project_id: currentProjectId },
    { project_id: null },
  ],
});
```

(Exact syntax depends on how the codebase handles OR conditions — use whatever pattern existing code uses.)

---

## Phase 4: Type regeneration

After the schema migration runs locally:

```sh
# Regenerate models from the live DB schema
yarn workspace @tupaia/types generate
```

This refreshes:
- `packages/types/src/types/models.ts` — `Entity` gets `project_id`
- `packages/types/src/schemas/schemas.ts` — `EntitySchema` and friends include `project_id`

Commit the regenerated files.

---

## Phase 5: Build and verification

```sh
yarn workspace @tupaia/database build
yarn workspace @tupaia/types build
yarn workspace @tupaia/server-boilerplate build
yarn workspace @tupaia/entity-server build
yarn workspace @tupaia/central-server build
yarn workspace @tupaia/meditrak-app-server build
yarn workspace @tupaia/web-config-server build
yarn workspace @tupaia/tupaia-web-server build
```

Resolve any TypeScript errors that surface from the regenerated `Entity` type (most likely places: anywhere that destructures Entity rows or constructs them).

---

## Migration runtime estimate

- Backfill UPDATE for 1-project entities: ~115k rows. Single statement with index on `entity_parent_child_relation(child_id)` — under 30s.
- Loop INSERT for ~104k duplicate rows: depends on batching. With per-row INSERT, ~5–10 minutes. With batched INSERT-from-VALUES, under 1 minute.
- Repoint UPDATE for ~397k survey_responses: heaviest step. Single statement, joining survey + entity-by-code-and-project. Likely 1–3 minutes.
- Constraint creation: under 30s each.

Total target: **under 10 minutes on prod-clone**. Rehearse before scheduling prod.

---

## Rollback plan

If the migration fails partway:

- The whole migration runs inside a transaction (db-migrate default). A failure rolls everything back automatically.
- If the migration succeeds but later issues are discovered:
  - The `down` migration restores `entity` to a state without `project_id`. It's destructive — duplicated rows are deleted. Acceptable for a hot rollback.
  - Run `yarn migrate-down` to reverse.

## Definition of done

- [ ] Migration runs cleanly on prod-clone in under 10 minutes
- [ ] Post-migration row counts match expectations (see QA plan): ~287k sub-country entities, ~104k new rows from duplication, 26,532 orphans assigned to explore
- [ ] CHECK constraint and UNIQUE constraint are present and enforced
- [ ] Unit + integration tests pass across all affected packages
- [ ] Manual QA test plan executed on staging without regressions
