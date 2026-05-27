# Entity hierarchy improvements

Project-level spec covering the multi-ticket refactor from "shared entities + per-hierarchy joins" to "per-project entity copies + `entity.parent_id` + `project_country` bridge". Individual tickets in [Ticket Summary](#ticket-summary).

## Context

Entities used to be shared across projects, joined into hierarchies via `entity_relation` and `entity_parent_child_relation`. Projects pointed at an `entity_hierarchy_id` to scope walks. After this project lands, every sub-country entity row belongs to exactly one project (`entity.project_id` NOT NULL), hierarchy edges live on `entity.parent_id` for sub-country and on a new `project_country` junction for the project ↔ country bridge, and the three legacy tables (`entity_relation`, `entity_parent_child_relation`, `entity_hierarchy`) go away. We accept more data duplication in exchange for a much simpler and safer mental model: one project = one set of entities = one set of edges = one closure cache.

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

Hierarchy walks are project-scoped recursive CTEs over a single edges subquery that unions sub-country `entity.parent_id` edges (filtered by the requested `project_id`) with `project_country` rows for the project↔country bridge — see `packages/database/src/core/modelClasses/projectHierarchyEdges.js`. The closure cache (`ancestor_descendant_relation`, keyed by `project_id` after TUP-3066a) is rebuilt per project from this same edges definition and used as the fast read path for `Entity.getAncestors/getDescendants/getChildren`.

---

## Sync impact

`project_id` is synced through to MediTrak / Datatrak clients. It is **not** added to `excludedFieldsFromSync`. Clients see a new column on entity records.

Mobile sync (`Entity.buildSyncLookupQueryDetails`) currently still joins `entity_parent_child_relation` to compute the per-entity project list for the sync lookup. TUP-3067 owns swapping that to `entity.parent_id` + `project_country` + the direct `entity.project_id`; until 3067 lands, the legacy table writes are dead but the reads remain. TUP-3066b's rewrite of `buildSyncLookupQueryDetails` is staged on the 3066b branch and gated on 3067.

---

## Out of scope

- **Removing project entities entirely.** Discussed and deferred. Project entities serve real purposes today (88 dashboards rooted at them + 226 project↔country relations in `entity_parent_child_relation`). Deferring until we're ready to handle dashboard rooting differently and lift the 226 relations into a `project_country` junction.
- **Unbundling `map_overlay.country_codes` triple-role** (scoping vs permission vs project indirection). Juliana flagged this; not required under this approach.

## Risks / things to watch

- **`entity.code` is no longer unique post-migration.** Many callsites assume `findOne({ code })` returns at most one row. The hot paths were swept under TUP-3060; remaining callsites are catalogued in the [audit](#bare-entityfindone-code--audit) below and tracked by TUP-3156.
- **Sync surface change.** `project_id` flows through to MediTrak / Datatrak clients. New column on entity records.
- **Cache invalidation.** `ancestor_descendant_relation` is truncated by the TUP-3056 data migration; the bootstrap rebuilds it on next central-server start. See the [closure cache invalidation](#cross-cutting-tasks) note for the local-dev edge case.
- **Production deploy ordering.** TUP-3056 landed shortly after TUP-3053 (entity_polygon split) — two large schema migrations on `entity` in quick succession. Watch for the same pattern when 3066b ships.
- **Heavy data migration.** Roughly ~104k entity inserts plus ~397k survey_response updates. Rehearsed on a staging clone before prod (~5:24 dev run, similar order of magnitude on prod).

---

### TUP-3156 — external sync flows

**Status: QA In Progress.** Product input has been resolved into per-integration decisions and all implementation PRs are merged (into `epic-entity-hierarchy`, except MS1 deletion which landed via `tup-3066b`). The only remaining open work is the Weather / Indicator / Data Lake follow-ups (entity ID vs code questions).

| Integration | Decision                                                     | Status                          |
| ----------- | ------------------------------------------------------------ | ------------------------------- |
| Weather API | Follow up entity ID vs code; map GIS polygon code to weather API | ⏳ Follow-up (Tom)               |
| Indicator   | Follow up entity ID vs code                                  | ⏳ Follow-up (Tom)               |
| Data Lake   | —                                                            | Julianna says move to entity.id |

# Ticket Summary

**C1: GIS Split & Entity Migration**

All merged

**C2: Hierarchy Remodel**

| ID        | Title                                                        | Status      |
| --------- | ------------------------------------------------------------ | ----------- |
| TUP-3068  | Simplify ancestor_descendant_relations rebuild algorithm     | Merged      |
| TUP-3065  | Consolidate hierarchy to parent_id on project-specific entities | Merged      |
| TUP-3066a | Rename hierarchyId → projectId (code + ancestor_descendant_relation schema) | Merged      |
| TUP-3066b | Drop entity_relation / entity_parent_child_relation / entity_hierarchy | Merged      |
| TUP-3067  | MediTrak compatibility layer                                 | In progress |
| TUP-3156  | External sync flows: project-scoping for entity code lookups | In QA (all PRs merged; Weather/Indicator/Data Lake follow-ups remain) |

**C3: Admin Panel Project Scoping**

All merged

**C4: Import/Export**

| ID       | Title                                           | Status      |
| -------- | ----------------------------------------------- | ----------- |
| TUP-3062 | Export entities in import-compatible format     | In progress |
| TUP-3064 | Update entity import                            | In progress |
| TUP-3061 | Update entity import for project-specific model | In progress |
| TUP-3063 | GIS Data Import & Export                        | In progress |

## Project Plan

### Milestone 1 — server-side correct (test-ready)

Server-side correctness against the new per-project entity model.

### Milestone 2 — safe for mobile + external sync (deploy-ready)

TUP-3067 & TUP-3156

---



### Import Export Test Plan



1. Hand-authored upload: edit the downloaded file, change the name, remove the id from properties, keep code + data_source.
   Re-upload. The same row updates (matched by natural key).
2. Unknown-id rejection: edit the file to set properties.id = "does_not_exist". Re-upload. Row-level error.
3. Delete: link a polygon to an entity first (see step 4 below), then delete the polygon. Confirm dialog → entities'
   entity_polygon_id becomes NULL (FK ON DELETE SET NULL).

4. Entity edit modal — polygon link

5. From any project view, edit an entity. The new "GIS polygon" picker is visible.
6. Pick the polygon you created in step 1. Save. Spot-check in DB: entity.entity_polygon_id set.
7. Edit the entity again. Clear the polygon (empty selection). Save. DB: entity.entity_polygon_id is NULL.

8. Entity Export (TUP-3062)

9. From /:projectCode/entities, click the page-header Download button.
10. Confirm in the modal. xlsx file downloads.
11. Open in Excel:
    - Single sheet named Entities (not per-country)
    - Columns in order: name, code, type, country_code, parent_code, attributes, image_url, entity_polygon_id,
    entity_polygon_code, entity_polygon_data_source, data_service_entity
    - Every row has country_code populated
    - attributes is a JSON string, not the legacy human-readable form
    - No geojson column anywhere
    - Country / world / project rows are absent

12. Entity Import — round-trip (TUP-3061)

13. From the same project, click Import. Upload the unchanged file you just downloaded. Expect 200, "Imported entities".
14. DB spot-check: pick one entity, updated_at_sync_tick advanced but name, code, parent_id, entity_polygon_id unchanged.

15. Entity Import — edit-and-reimport

16. In Excel, change one entity's name. Re-upload. That entity's name updates, nothing else does.

17. Entity Import — validation cases

For each, expect a non-200 response with a clear error message:

| Scenario | How to provoke | Expected error |
| --- | --- | --- |
| Missing `projectCode` | Hit `POST /v1/import/entities` directly (curl / browser devtools) with no query param | `"projectCode … required"` |
| Wrong project | Switch to a project that does NOT have country X, then upload a file containing rows with `country_code = X` | `"country_code … is not in project …"` |
| Missing `country_code` on a row | Blank the `country_code` cell in one row, re-upload | `"Missing country_code … row N"` |
| Inline geojson rejected | Add a `geojson` column with a Polygon JSON in one row, re-upload | Row-level error (geojson is silently ignored or rejected, depending on validator wiring — confirm behaviour) |
| Unknown `entity_polygon_id` | Edit a row to set `entity_polygon_id` to a junk string, re-upload | `"Unknown entity_polygon_id …"` |
| Natural-key only — known | Clear `entity_polygon_id`, fill `entity_polygon_code` + `entity_polygon_data_source` pointing at a real polygon. Re-upload | 200, polygon link preserved (DB: `entity.entity_polygon_id` = that polygon's id) |
| Natural-key only — unknown | Same as above with a code/data_source pair that doesn't exist | `"No entity_polygon found for code …"` |
| ID + natural-key mismatch | Set `entity_polygon_id` to polygon A's id, set `code`+`data_source` to polygon B. Re-upload | `"does not match the polygon found by code …"` |
| Parent in another project | Edit a row's `parent_code` to reference an entity in a different project's hierarchy | Row-level error from `getOrCreateParentEntity` (`"No entity matching parent code …"`) |

7. New-country net-new upload (the workflow these flips were designed for)

1. Step 1: author a GeoJSON FeatureCollection of polygons. Each feature's properties has name, code like KH_district_01,
   data_source like kh_setup_2026. Upload via GIS Data page.
2. Step 2: author an xlsx with the new column shape. For each row that needs a polygon, fill entity_polygon_code +
   entity_polygon_data_source with the values you used in step 1. No entity_polygon_id needed.
3. Upload via Entity Import. Spot-check DB: those entities now have entity_polygon_id pointing at the right rows. No id
   hunt required.

8. Hierarchy export removed (TUP-3064)

1. Navigate to the Hierarchies page (under Visualisations or wherever it lives in your nav).
2. Tree view still renders.
3. No "Export" button in the header.
4. Direct GET /v1/export/hierarchies?hierarchies=foo → 404.

9. OSM auto-fetch removed

1. Open the Entity Import modal. The "Automatically fetch GeoJSON" checkbox is gone.
2. Upload a file with no polygon references. Confirm no outbound HTTP calls to nominatim.openstreetmap.org or
   polygons.openstreetmap.fr (network tab or central-server logs).

10. All Data view — import disabled

1. Navigate to /entities/countries or any All Data view. The Entities tab is not in the nav there (it's
   SINGLE_PROJECT_SCOPE only).
2. Hit POST /v1/import/entities without projectCode directly — expect 400.

---
Things to watch for as you go:
- Browser console errors / unhandled rejections in the admin panel
- Central-server log warnings about the country_code mismatches or sync ticks
- Any 500s — those usually point at SQL the new code missed



