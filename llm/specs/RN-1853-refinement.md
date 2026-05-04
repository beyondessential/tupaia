# RN-1853 — Add project_id to entities and duplicate shared entities per project

[Linear ticket](https://linear.app/bes/issue/RN-1853/add-project-id-to-entities-and-duplicate-shared-entities-per-project)

## Context

Currently entities are shared across projects. Projects reference entities via `entity_id` (root entity) and `entity_hierarchy_id`. After this change, every entity row belongs to exactly one project. This accepts more data duplication in exchange for a much simpler and safer mental model.

### Summary of prod data (60 projects, ~180k entities)

- Every project has a `type='project'` entity at the root (60/60).
- Project entity → country structure: 226 `project → country` relations in `entity_parent_child_relation`. No other parent-type combinations.
- Country sharing is heavy: Fiji appears in 20 project hierarchies, Samoa 14, PNG 11, Nauru 10, etc.
- `user_entity_permission.entity_id`, `access_request.entity_id`, `map_overlay.country_codes` → all resolve only to country/project entities.
- `dashboard.root_entity_code` → some sub-country roots, but codes are de facto unique today.

---

## Approach: Nullable Project & Country Entities

Leave `project_id` NULL for `world`, `project`, and `country` entities. Sub-country entities (`district`, `facility`, `individual`, `case`, `household`, etc.) get NOT-NULL `project_id` and are duplicated per project.

These three structural types are functionally distinct from data entities — they're shared anchors that the rest of the system organises around. Permissions, map overlay scoping, and dashboard roots already operate at country/project level. Treating them as shared isn't asymmetry for migration convenience; it reflects how the system already works.

### Why

- Sub-country entities — where data lives and edits happen — get full per-project semantics with no cross-project bleed.
- Permissions, access requests, map overlays keep working as-is. No row duplication, no schema change.
- Dashboards: no duplication; one targeted change to make `root_entity_code → entity` resolution project-aware.
- Avoids creating N identical Fiji rows that all have to stay in sync.

---

## Schema changes

### `entity.project_id` column

- **Nullability**: NOT NULL for sub-country entity types; NULL for `world`, `project`, `country`.
- **CHECK constraint**: `(type IN ('world','project','country') AND project_id IS NULL) OR project_id IS NOT NULL`. Applied at the end of the migration after backfill completes (same migration file). This also serves as the write-time enforcement — no additional logic needed.
- **FK on-delete**: `RESTRICT`. Project deletion is rare and should require entities to be moved or deleted as a pre-requisite — fail loudly rather than silently cascading.
- **Composite uniqueness**: `UNIQUE (code, project_id)`. Each code is unique within a project. Postgres treats NULL as distinct in unique constraints, so the structural types are not uniqueness-checked under this rule, which is fine — codes are already unique among those rows.

### Identity tracking

Not needed. `entity.code` is sufficient as the implicit cross-project identity. No `canonical_id` column or similar.

### Definition of "shared"

An entity is shared if it appears in more than one project's hierarchy.

---

## Data migration

### Identifying which projects an entity belongs to

```sql
SELECT
  entity.id AS entity_id,
  array_agg(DISTINCT p.id ORDER BY p.id) AS project_ids
FROM entity
JOIN entity_parent_child_relation epcr ON entity.id = epcr.child_id
JOIN project p ON p.entity_hierarchy_id = epcr.entity_hierarchy_id
WHERE entity.type NOT IN ('world', 'project', 'country')
GROUP BY entity.id;
```

Validation against prod data — out of 182,549 sub-country entities:

- **115,794 (63%)** appear in exactly 1 project → no duplication, just set `project_id`
- **39,168 (21%)** appear in 2–5 projects → 2–5 copies each
- **1,028 (~1%)** appear in 6–10 projects → 6–10 copies each
- **27** appear in >10 projects → heavy duplication (e.g. Fiji districts in 16 projects)
- **26,532 (15%)** are orphans (no `entity_parent_child_relation` entry pointing at any project's hierarchy)

Estimated post-migration row count: ~287k sub-country entities (~1.6× current 182k).

### Sub-country entity duplication

- **Original row stays.** Gets one project assigned; N-1 new rows are created for the remaining projects.
- **Custom / parallel hierarchies** are included in the per-project count. An entity that appears in three custom hierarchies is duplicated into all three projects.
- **Entity types already 1:1 with their data** (`individual`, `case`, `household`, etc.) get `project_id` set but are not duplicated — they already exist within one project's data flow.

### Re-pointing entity-id-linked tables

For each `survey_response` whose `entity_id` points at a sub-country entity, look up the per-project copy via `survey.project_id` and re-point.

- Lookup chain: `survey_response.survey_id → survey.project_id`. Every survey has a `project_id` set (0 NULL), so every response has a deterministic project — no legacy un-mapped case to handle.
- Standard re-point query: find `entity` row where `code` matches AND `project_id = survey.project_id`.

Validation against prod data — out of 397,584 responses pointing at sub-country entities:

- **397,540 (99.99%)** — survey's project IS in entity's hierarchy → clean re-point
- **24 responses** — survey's project NOT in entity's hierarchy (pre-existing data anomaly)
- **20 responses** — entity has no project mapping at all (orphan entity)

The 44 anomalies get re-pointed to the explore-project copy of the entity, marked with `metadata.migrated_from_orphan_response = true` for later audit.

`task.entity_id`, `survey_response_draft.entity_id`, and other entity-id FKs follow the same per-project repoint pattern using their owning project's context.

`access_request.entity_id` and `user_entity_permission.entity_id` are unaffected — they only point at country/project entities, which aren't being duplicated.

### Orphan handling

The 26,532 orphaned sub-country entities (no project mapping) get assigned to the **explore** project. Mark them with `metadata.orphaned = true` so we can find them later.

The migration looks the explore project up by code (`SELECT id FROM project WHERE code = 'explore'`) and uses that ID for orphan / anomaly reassignment. Fail-fast if it's not present (sanity check) — a single `code = 'explore'` project is guaranteed to exist.

### Cleanup of erroneous project-pointing rows

Three known data-hygiene rows to delete during migration:

- `user_entity_permission` id `5fa0cb6361f76a679a05c822` — `elis.wafiware@gmail.com` → STRIVE PNG (entity code `strive`) with permission group `STRIVE User`
- `user_entity_permission` id `5fb37ce361f76a7cdf03b81f` — `unicef.laos.edu@gmail.com` → Laos Schools (entity code `laos_schools`) with permission group `LESMIS Public`
- `access_request` id `5f9f54c461f76a679a048105` — `elis.wafiware@gmail.com` → STRIVE PNG (entity code `strive`)

These were almost certainly admin-panel mis-clicks (admin selected a project entity instead of a country entity).

---

## Code & consumer updates

### Dashboard `root_entity_code` resolution

The render path becomes project-aware: `WHERE entity.code = ? AND entity.project_id = ?` (or `IS NULL` for country/project-rooted dashboards). One targeted change.

Map overlays and dashboards do not need duplication — they keep their existing rows.

### Hierarchy walks (recursive CTEs)

Audited the codebase. Exactly one site walks `entity.parent_id` recursively: `EntityParentChildRelationBuilder.getRelationsViaCanonical` in `packages/database/src/server/changeHandlers/entityHierarchyCacher/`. Used as the canonical fallback when no `entity_relation` exists at a hierarchy level.

Post-migration this would return children across all projects. Fix is small: thread `project.id` through `rebuildRelationsForEntity → fetchAndCacheChildren → getRelationsViaCanonical` and add `project_id: project.id` to the `entity.find` criteria. **In scope for RN-1853.**

All other recursive walks of the hierarchy use `entity_parent_child_relation` filtered by `entity_hierarchy_id`, which is already project-scoped — unaffected:

- `Entity.getEntitiesFromParentChildRelation` — recursive CTE on `entity_parent_child_relation`
- `EntityHierarchySubtreeRebuilder.fetchAndCacheDescendants` — uses `entity_parent_child_relation`
- `Project.countries()` — uses `entity_relation`

---

## Sync impact

`project_id` is synced through to MediTrak / Datatrak clients. It is **not** added to `excludedFieldsFromSync`. Clients see a new column on entity records.

---

## Hierarchy / relations table futures

- **`entity_hierarchy` table**: kept as-is for RN-1853. `entity_hierarchy_id` on project still maps a project to its hierarchy ID. Removing it is RN-1864's scope.
- **Hierarchy semantics across the NULL/NOT-NULL `project_id` boundary**: not a long-term concern. [RN-1862](https://linear.app/bes/issue/RN-1862/consolidate-hierarchy-to-parent-id-on-project-specific-entities) will remove `entity_parent_child_relation` entirely and consolidate hierarchy onto `entity.parent_id`. For RN-1853, the existing relation rows continue to work as-is during the transition; the NULL / NOT-NULL distinction lives on `entity` rows, not on the relation rows themselves.

---

## Out of scope

- **Removing project entities entirely.** Discussed and deferred. Project entities serve real purposes today (88 dashboards rooted at them + 226 project↔country relations in `entity_parent_child_relation`). Deferring until we're ready to handle dashboard rooting differently and lift the 226 relations into a `project_country` junction.
- **`project_country` junction table.** Only needed once `entity_parent_child_relation` is removed. Belongs with [RN-1864](https://linear.app/bes/issue/RN-1864/remove-entity-relation-and-entity-hierarchy-tables).
- **Unbundling `map_overlay.country_codes` triple-role** (scoping vs permission vs project indirection). Juliana flagged this; not required under this approach.
- **Removing `entity_parent_child_relation`** — [RN-1862](https://linear.app/bes/issue/RN-1862/consolidate-hierarchy-to-parent-id-on-project-specific-entities).
- **Removing `entity_hierarchy` and `entity_relation` tables** — [RN-1864](https://linear.app/bes/issue/RN-1864/remove-entity-relation-and-entity-hierarchy-tables).
- **Project-scoping all entity queries** — [RN-1854](https://linear.app/bes/issue/RN-1854/ensure-all-entity-access-is-project-scoped). Bleeds into RN-1853 only where callsites break; the bulk is its own ticket.

---

## Risks / things to watch

- **`entity.code` is no longer unique post-migration.** Many callsites assume `findOne({ code })` returns at most one row. Will need a codebase audit (mostly RN-1854 territory).
- **Sync surface change.** `project_id` flows through to MediTrak / Datatrak clients. New column on entity records.
- **Cache invalidation.** `EntityHierarchyCacher` and other materialised views may need rebuilding after the migration.
- **Production deploy ordering.** This lands shortly after RN-1851 (entity_polygon split) — second large schema migration on `entity` in quick succession. Coordinate deploy and rollback plans.
- **Heavy data migration.** Roughly ~104k entity inserts plus ~397k survey_response updates. Rehearse on a staging clone before prod.
