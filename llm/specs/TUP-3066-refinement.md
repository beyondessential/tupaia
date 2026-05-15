# TUP-3066 — Retire `entity_relation` / `entity_parent_child_relation` / `entity_hierarchy`

Original TUP-3066 has been split into two stacked PRs:

- **TUP-3066a** — code-level rename `hierarchyId` → `projectId`, plus schema rename `ancestor_descendant_relation.entity_hierarchy_id` → `project_id`.
- **TUP-3066b** — drop the three legacy tables, model classes, `project.entity_hierarchy_id` column, and `/entityHierarchy/:id` admin routes.

## Branch stack

```
dev
  └─ epic-entity-hierarchy
      └─ #6776 TUP-3060   (foundation)             ← MERGED
      └─ #6777 TUP-3068   (cache rebuild)          ← in review
          └─ #6778 TUP-3065 (consumer retirement)  ← in review (base for 3066a)
              └─ tup-3066a-rename-hierarchy-id-to-project-id
                  └─ tup-3066b-drop-legacy-tables
```

3066a/b stack on **#6778** (TUP-3065) — they functionally depend on the entity_relation consumer switches being in place.

---

## TUP-3066a — Rename `hierarchyId` → `projectId`

**Goal.** Eliminate the legacy "hierarchy ID" identifier from the code path. Every hierarchy walk is project-scoped now; the indirection through `entity_hierarchy_id` is dead weight and forces an extra `findOneOrThrow({ entity_hierarchy_id })` lookup per traversal (closes review-hero comment #3217296820 on PR #6777).

### Schema migration

Rename `ancestor_descendant_relation.entity_hierarchy_id` → `project_id` via add-backfill-drop.

```sql
ALTER TABLE ancestor_descendant_relation
  ADD COLUMN project_id text REFERENCES project(id) ON DELETE CASCADE;

UPDATE ancestor_descendant_relation a
  SET project_id = p.id
  FROM project p
  WHERE a.entity_hierarchy_id = p.entity_hierarchy_id;

ALTER TABLE ancestor_descendant_relation
  ALTER COLUMN project_id SET NOT NULL,
  DROP COLUMN entity_hierarchy_id;

-- Index swap to match
DROP INDEX IF EXISTS ancestor_descendant_relation_entity_hierarchy_id_idx;
CREATE INDEX ancestor_descendant_relation_project_id_idx
  ON ancestor_descendant_relation(project_id);
```

The cache is short-lived and bootstrap rebuilds it on empty — if anything goes sideways with the backfill, deleting the rows and letting `AncestorDescendantCacheBuilder.rebuildAll()` repopulate is safe.

### Code changes

**`packages/database/src/core/modelClasses/Entity.js`** — rename `hierarchyId` parameter to `projectId` across the hierarchy methods:

- Record methods: `getAncestors`, `getDescendants`, `getAncestorsFromParentChildRelation`, `getDescendantsFromParentChildRelation`, `getChildren`, `getChildrenFromParentChildRelation`, `getParent`, `getParentFromParentChildRelation`, `getAncestorsOfType`, `getDescendantsOfType`, `getAncestorOfType`, `getRelativesOfType`, `getNearestAncestorOfType`, `getAncestorCodes`, `getChildrenOfType`
- Model methods: `getAncestorsOfEntities`, `getDescendantsOfEntities`, `getEntitiesFromParentChildRelation`
- Drop the `findOneOrThrow({ entity_hierarchy_id })` lookup at the top of `getEntitiesFromParentChildRelation` — `projectId` is already provided
- **Delete `getChildrenViaHierarchy`** — dead after PR3 (#6778) retires its central-server callers; only Project.js still uses it, and Project.js's `hasAccess`/`hasAdminAccess` are also rewritten to `project.countries()` in PR3

**`packages/database/src/server/changeHandlers/entityHierarchyCacher/AncestorDescendantCacheBuilder.js`** — `rebuildForProject` DELETE/INSERT queries use `project_id` instead of `entity_hierarchy_id`. No more `entity_hierarchy_id` lookup in this file.

**`packages/database/src/server/changeHandlers/entityHierarchyCacher/EntityHierarchyCacher.js`** — `translateEntityHierarchyChange` still listens to entity_hierarchy changes (the table still exists in 3066a; goes away in 3066b). Translates hierarchy → projects via `project.find({ entity_hierarchy_id: hierarchyId })` as before.

**`packages/database/src/core/modelClasses/Project.js`** — call sites that pass `this.entity_hierarchy_id` now pass `this.id`. `hasAccess`/`hasAdminAccess` already use `this.countries()` from PR3.

**`packages/database/src/core/modelClasses/AncestorDescendantRelation.js`** — adjust any column references.

**`packages/datatrak-web/src/database/entity/getEntityDescendants.ts`, `getEntityAncestors.ts`** — rename parameter, change callers to pass project.id.

**`packages/datatrak-web/src/utils/extendedFieldFunctions.ts`, `formatEntity.ts`** — rename parameters.

**`packages/entity-server/src/routes/hierarchy/**`** — ~12 route files use hierarchy context. Update middleware:
- `attachEntityContext.ts`, `attachCommonEntityContext.ts` — context holds `projectId` instead of `hierarchyId`
- `types.ts` — context type rename
- `EntityDescendantsRoute.ts`, `EntityAncestorsRoute.ts`, `MultiEntityDescendantsRoute.ts`, `MultiEntityAncestorsRoute.ts`, `MultiEntityRelativesRoute.ts`, `EntityRelativesRoute.ts`, `EntitySearchRoute.ts`, `format.ts`, `relationships/ResponseBuilder.ts` — consume from context
- `HierarchiesRoute.ts` (entity-server) — admin route serving `entity_hierarchy` rows; survives 3066a, dies in 3066b

**`packages/central-server/src/apiV2/projects/GETProjects.js`, `CreateProject.js`** — internal rename where applicable.

**`packages/types/src/types/models.ts`, `schemas/schemas.ts`** — regenerate via `yarn workspace @tupaia/types generate` after schema migration.

**Tests** — fixture and test updates:
- `packages/database/src/__tests__/modelClasses/Entity.test.js`
- `packages/database/src/__tests__/modelClasses/Entity/getDescendantsAncestorsProjectScoping.test.js`
- `packages/database/src/server/testUtilities/buildAndInsertProjectsAndHierarchies.js` — callers may pass through

**Migration cleanup considerations**: The data migration `20260501000001-backfillProjectIdsAndDuplicateSharedEntities-modifies-data.js` ends with `DELETE FROM ancestor_descendant_relation` so on next boot the cache rebuilds with the new column. No special migration ordering needed.

### Closes review-hero comments

- #3217296820 (PR #6777) — extra DB round-trip per traversal

### Risk

Low. Pure rename plus one cache-table schema change. The cache self-heals on next boot if anything goes sideways.

---

## TUP-3066b — Drop legacy tables

**Goal.** Remove the three legacy tables and their model classes. Mechanical cleanup once the rename is in.

### ⚠️ Gating

**Cannot merge until TUP-3067 (MediTrak compatibility) lands.** Mobile sync still pulls `entity_parent_child_relation` rows for the local hierarchy cache — see `Entity.js` `buildSyncLookup` at `:944` and `:982`. Dropping the table breaks mobile sync hard.

Drafting now lets us review the code, but the schema migrations stay in draft / branch-only until 3067 ships.

### Schema migrations

Three migrations, in dependency order:

1. Drop `project.entity_hierarchy_id` column (after all code references gone).
2. Drop `ancestor_descendant_relation`'s FK to `entity_hierarchy` (if any beyond column).
3. Drop tables: `entity_relation`, `entity_parent_child_relation`, `entity_hierarchy`.

### Code changes

**Model class deletions**:
- `packages/database/src/core/modelClasses/EntityRelation.js`
- `packages/database/src/core/modelClasses/EntityParentChildRelation.js`
- `packages/database/src/core/modelClasses/EntityHierarchy.js`

**Registrations to remove**:
- `packages/database/src/core/records.js` — remove `ENTITY_RELATION`, `ENTITY_PARENT_CHILD_RELATION`, `ENTITY_HIERARCHY`
- `packages/database/src/core/sync/initSyncComponents.js` — remove sync registrations for the three tables
- `packages/database/src/server/runPostMigration.js` — remove from post-migration table list
- `packages/database/src/server/testUtilities/clearTestData.js` — remove from cleanup list

**Fixture cleanup**:
- `packages/database/src/server/testUtilities/buildAndInsertProjectsAndHierarchies.js` — drop the legacy `entity_relation` writes (the stop-gap from PR2). Also drop `entityHierarchy` creation since the table is gone.

**Sync lookup rewrite** (depends on TUP-3067):
- `packages/database/src/core/modelClasses/Entity.js` `buildSyncLookup` — replace `entity_parent_child_relation` joins. With the new model, sync set is computed from `entity.parent_id` + `project_country` directly, or from a TUP-3067-provided compatibility layer.

**Project lifecycle**:
- `packages/central-server/src/apiV2/projects/CreateProject.js` — drop `entityHierarchy` row creation step
- `packages/central-server/src/apiV2/entities/DeleteEntity.js` — drop `entity_relation` cleanup
- `packages/database/src/core/modelClasses/Project.js` — remove `entity_hierarchy_id` field usage entirely

**Admin route retirement**:
- `packages/central-server/src/apiV2/entityHierarchy/GETEntityHierarchy.js`, `EditEntityHierarchy.js`, `assertEntityHierarchyPermissions.js` — delete
- `packages/central-server/src/apiV2/index.js` — drop route registration
- `packages/central-server/src/tests/apiV2/entityHierarchy/*` — delete tests
- `packages/entity-server/src/routes/hierarchies/HierarchiesRoute.ts` — delete

**Type updates**:
- `packages/datatrak-web/src/types/model.ts` — drop `entityParentChildRelation`, `entityRelation`, `entityHierarchy` from `ModelRegistry`
- `packages/types/src/types/models.ts`, `schemas/schemas.ts` — regenerate

### Risk

High in production (irreversible table drops, depends on mobile compatibility). Low in code structure — purely subtractive.

---

## Implementation order

1. **Check out PR #6778 head**, branch `tup-3066a-rename-hierarchy-id-to-project-id`.
2. Write schema migration (add-backfill-drop on `ancestor_descendant_relation`).
3. Run `yarn migrate` locally; `yarn workspace @tupaia/types generate`.
4. Rename in `Entity.js`, then ripple out through callers (test-driven: build, lint, type-check at each step).
5. Update entity-server middleware + routes.
6. Update datatrak-web entity accessors.
7. Update tests.
8. Build all affected packages; run `yarn workspace @tupaia/central-server test` and `@tupaia/database test`.
9. Push 3066a, open PR.
10. Branch `tup-3066b-drop-legacy-tables` off 3066a head.
11. Schema migrations to drop tables.
12. Delete model classes + registrations.
13. Sync-lookup rewrite (drafted; coordinates with TUP-3067 review).
14. Retire admin routes.
15. Test, push 3066b, open PR. **PR description must call out TUP-3067 gating.**

---

## Outstanding questions

- TUP-3066b sync-lookup rewrite: depends on TUP-3067's compatibility-layer design. If 3067 provides a shim that translates parent_id walks into legacy-shape sync sets, 3066b can simply delete the joins. If 3067 ships a new mobile build, 3066b owns the rewrite. Need to coordinate.
