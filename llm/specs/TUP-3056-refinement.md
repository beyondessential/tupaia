# TUP-3056 — Add project_id to entities and duplicate shared entities per project

[Linear ticket](TUP-3056/add-project-id-to-entities-and-duplicate-shared-entities-per-project)

> Originally tracked as RN-1853; renumbered to TUP-3056 after a Linear workspace
> reorganisation. The implementation PR (#6749) and earlier commit messages still
> reference the RN-1853 identifier.

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

Post-migration this would return children across all projects. Fix is small: thread `project.id` through `rebuildRelationsForEntity → fetchAndCacheChildren → getRelationsViaCanonical` and add `project_id: project.id` to the `entity.find` criteria. **In scope for TUP-3056.**

All other recursive walks of the hierarchy use `entity_parent_child_relation` filtered by `entity_hierarchy_id`, which is already project-scoped — unaffected:

- `Entity.getEntitiesFromParentChildRelation` — recursive CTE on `entity_parent_child_relation`
- `EntityHierarchySubtreeRebuilder.fetchAndCacheDescendants` — uses `entity_parent_child_relation`
- `Project.countries()` — uses `entity_relation`

---

## Sync impact

`project_id` is synced through to MediTrak / Datatrak clients. It is **not** added to `excludedFieldsFromSync`. Clients see a new column on entity records.

---

## Hierarchy / relations table futures

- **`entity_hierarchy` table**: kept as-is for TUP-3056. `entity_hierarchy_id` on project still maps a project to its hierarchy ID. Removing it is TUP-3066's scope.
- **Hierarchy semantics across the NULL/NOT-NULL `project_id` boundary**: not a long-term concern. [TUP-3065](TUP-3065/consolidate-hierarchy-to-parent-id-on-project-specific-entities) will remove `entity_parent_child_relation` entirely and consolidate hierarchy onto `entity.parent_id`. For TUP-3056, the existing relation rows continue to work as-is during the transition; the NULL / NOT-NULL distinction lives on `entity` rows, not on the relation rows themselves.

---

## Out of scope

- **Removing project entities entirely.** Discussed and deferred. Project entities serve real purposes today (88 dashboards rooted at them + 226 project↔country relations in `entity_parent_child_relation`). Deferring until we're ready to handle dashboard rooting differently and lift the 226 relations into a `project_country` junction.
- **`project_country` junction table.** Only needed once `entity_parent_child_relation` is removed. Belongs with [TUP-3066](TUP-3066/remove-entity-relation-and-entity-hierarchy-tables).
- **Unbundling `map_overlay.country_codes` triple-role** (scoping vs permission vs project indirection). Juliana flagged this; not required under this approach.
- **Removing `entity_parent_child_relation`** — [TUP-3065](TUP-3065/consolidate-hierarchy-to-parent-id-on-project-specific-entities).
- **Removing `entity_hierarchy` and `entity_relation` tables** — [TUP-3066](TUP-3066/remove-entity-relation-and-entity-hierarchy-tables).
- **Project-scoping all entity queries** — [TUP-3060](TUP-3060/ensure-all-entity-access-is-project-scoped). Bleeds into TUP-3056 only where callsites break; the bulk is its own ticket.

---

## Risks / things to watch

- **`entity.code` is no longer unique post-migration.** Many callsites assume `findOne({ code })` returns at most one row. Will need a codebase audit (mostly TUP-3060 territory).
- **Sync surface change.** `project_id` flows through to MediTrak / Datatrak clients. New column on entity records.
- **Cache invalidation.** `EntityHierarchyCacher` and other materialised views may need rebuilding after the migration.
- **Production deploy ordering.** This lands shortly after TUP-3053 (entity_polygon split) — second large schema migration on `entity` in quick succession. Coordinate deploy and rollback plans.
- **Heavy data migration.** Roughly ~104k entity inserts plus ~397k survey_response updates. Rehearse on a staging clone before prod.



**Ticket Summary**

**C1: GIS Split & Entity Migration**

| ID       | Title                                                        | Status         |
| -------- | ------------------------------------------------------------ | -------------- |
| TUP-3053 | Schema migration: Create entity_geolocations table           | Merged to epic |
| TUP-3056 | Add project_id to entities and duplicate shared entities per project | Merged to epic |
| TUP-3060 | Ensure all entity access is project-scoped                   | Refined        |

**C2: Hierarchy Remodel**

| ID       | Title                                                           | Status      |
| -------- | --------------------------------------------------------------- | ----------- |
| TUP-3065 | Consolidate hierarchy to parent_id on project-specific entities | In progress |
| TUP-3068 | Simplify ancestor_descendant_relations rebuild algorithm        | Refined     |
| TUP-3066 | Remove entity_relation and entity_hierarchy tables              | Refined     |
| TUP-3067 | MediTrak compatibility layer                                    | Refined     |

**C3: Admin Panel Project Scoping**

| ID       | Title                                                           | Status      |
| -------- | --------------------------------------------------------------- | ----------- |
| TUP-3055 | Add global project filter to admin panel (frontend)             | In progress |
| TUP-3054 | Support project scope in admin-panel-server endpoints (backend) | In progress |

**C4: Import/Export**

| ID       | Title                                           | Status  |
| -------- | ----------------------------------------------- | ------- |
| TUP-3062 | Export entities in import-compatible format     | Refined |
| TUP-3064 | Update entity import                            | Refined |
| TUP-3061 | Update entity import for project-specific model | Refined |
| TUP-3063 | GIS Data Import & Export                        | Refined |

**C5: Onboarding**

| ID       | Title                                             | Status |
| -------- | ------------------------------------------------- | ------ |
| TUP-1582 | Project setup: copy entities from another project |        |

---

## Release path for C1 + C2

C1 + C2 together is the right release unit for the project-specific entity model. Tickets land on the load-bearing path **3053 → 3056 → 3060 → 3065**, then the destructive cleanup **3067 → 3066** trails afterwards. Staging the rollout as three deployable milestones is safer than a single big-bang.

### Milestone 1 — server-side correct (test-ready)

- **TUP-3060** — audit and project-scope every entity query across central-server, entity-server, report-server, data-table-server, orchestration servers, and admin-panel-server. Includes codebase-wide audit of `findOne({ code })` callsites that assume `entity.code` uniqueness (broken by 3056).
- Land **TUP-3056 (#6749)** and **TUP-3065 (#6761)** through review and merge.

After this, internal QA can validate project-scoped behaviour end-to-end. Entities are duplicated by 3056 but consumer queries may leak across projects without 3060.

### Milestone 2 — safe for mobile (deploy-ready)

- **TUP-3067** — MediTrak compatibility layer. Mobile sync still pulls `entity_parent_child_relation` and `entity_relation` rows; after 3065 those are dead writes server-side. Either translate parent_id walks into the legacy shapes at the sync API boundary, or ship a mobile build that knows the new shape. Currently estimated at 13 points — biggest remaining effort.

Until 3067 is in production, **do not** drop the legacy tables — mobile sync would silently drift.

### Milestone 3 — schema clean (cleanup)

- **TUP-3066** — schema migration to drop `entity_relation`, `entity_parent_child_relation`, `entity_hierarchy`; remove the model classes; drop `project.entity_hierarchy_id`. Mostly mechanical once 3067 has been verified in production.

### Cross-cutting tasks

- **Refresh `packages/database/schema/schema.sql`** — currently 71 migrations behind. Bites new dev environments and local validation. Worth doing once the migrations have stabilised.
- **Production data-migration rehearsal** of 3056 on a dev clone, then prod with a monitored runbook (~5:24 on dev clone, prod is similar order of magnitude). Coordinate with the GIS-split (3053) deploy so we're not changing `entity` schema twice in quick succession.
- **Sync surface coordination** — explicitly remove `entity_parent_child_relation` from `initSyncComponents.js` / `runPostMigration` once 3067 is ready (currently deferred with a TODO pointing to 3067).

### Adjacent tracks (separate releases)

- **C3** (admin-panel project scoping) — TUP-3054, TUP-3055 — depends on C1 + C2 server changes but ships independently.
- **C4** (import/export) — TUP-3061, TUP-3062, TUP-3063, TUP-3064 — also depends on the new project-specific model.

### TL;DR

Remaining work is essentially **3060 + 3067 + 3066**, plus shepherding **3056 and 3065** through review, plus the **schema.sql refresh**.
