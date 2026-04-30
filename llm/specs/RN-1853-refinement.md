# RN-1853 — Add project_id to entities and duplicate shared entities per project

[Linear ticket](https://linear.app/bes/issue/RN-1853/add-project-id-to-entities-and-duplicate-shared-entities-per-project)

## Approach: marker-based

Leave `project_id` NULL for `world`, `project`, and `country` entities. Sub-country entities (`district`, `facility`, `individual`, `case`, `household`, etc.) get NOT-NULL `project_id` and are duplicated per project.

These three structural types are functionally distinct from data entities — they're shared anchors that the rest of the system organises around. Permissions, map overlay scoping, and dashboard roots already operate at country/project level. Treating them as shared isn't asymmetry for migration convenience; it reflects how the system already works.

### Validation against prod data (60 projects, ~180k entities)

- Every project has a `type='project'` entity at the root (60/60).
- Project entity → country structure: 226 `project → country` relations in `entity_parent_child_relation`. No other parent-type combinations.
- Country sharing is heavy: Fiji appears in 20 project hierarchies, Samoa 14, PNG 11, Nauru 10, etc.
- `user_entity_permission.entity_id`, `access_request.entity_id`, `map_overlay.country_codes` → all resolve only to country/project entities.
- `dashboard.root_entity_code` → some sub-country roots, but codes are de facto unique today.

### Why this approach

- Sub-country entities — where data lives and edits happen — get full per-project semantics with no cross-project bleed.
- Permissions, access requests, map overlays keep working as-is. No row duplication, no schema change.
- Dashboards: no duplication; one targeted change to make `root_entity_code → entity` resolution project-aware.
- Avoids creating N identical Fiji rows that all have to stay in sync.

---

## Resolved questions

**Q1. `project_id` nullability.**
NOT NULL for sub-country entity types. NULL for `world`, `project`, `country`. Enforce via CHECK constraint:
`(type IN ('world','project','country') AND project_id IS NULL) OR project_id IS NOT NULL`.
Orphaned sub-country entities (currently no project) get assigned to the **explore** project. Mark them with `metadata.orphaned = true` so we can find them later.

**Q2. Entity types already 1:1 with their data (`individual`, `case`, `household`, etc.).**
Set `project_id`; no duplication needed. They already exist within one project's data flow.

**Q3. Definition of "shared".**
An entity is shared if it appears in more than one project's hierarchy.

**Q4. Custom/parallel hierarchies.**
Yes — duplicate based on appearance in parallel/alternate hierarchies as well.

**Q5. Original row stays vs. delete-and-recreate-N.**
Original stays unless there's a specific reason to delete it. Net effect: original row gets one project assigned, N-1 new rows created for the remaining projects.

**Q6. Other entity-id-linked tables (`task.entity_id`, `survey_response_draft.entity_id`, etc.).**
Repoint each row to the per-project copy of its owning project. (`access_request.entity_id` is unaffected — those references stay on country/project entities, which aren't duplicated.)

**Q7. Production scale.**
~180,000 entities in prod. Best estimate is roughly 2× post-migration (only sub-country entities duplicate; structural types stay singular).

**Q8. Visualisation duplication.**
Not needed under marker-based. Map overlays and dashboards keep their existing rows.

**Q9. `dashboard.root_entity_code` project-aware resolution.**
Yes — render path becomes `WHERE entity.code = ? AND entity.project_id = ?` (or NULL for country roots). One targeted change.

**Q10. MediTrak / Datatrak sync.**
Sync `project_id` through. Don't add it to `excludedFieldsFromSync`.

**Q11. `entity_hierarchy` table fate.**
Keep as-is for RN-1853. `entity_hierarchy_id` on project still maps a project to its hierarchy ID. Removing it is RN-1864's scope, not this ticket's.

**Q12. Orphan detection at write time.**
The CHECK constraint from Q1 enforces it: NULL `project_id` is only allowed for `world` / `project` / `country`. Sub-country entity types must always have a `project_id`. No additional write-time logic needed.

**Q13. CHECK constraint timing.**
Add the CHECK constraint at the end of the migration, after the data backfill has populated `project_id` on every sub-country entity. Same migration file.

**Q14. Hierarchy semantics across the NULL/NOT-NULL boundary.**
Not a long-term concern — [RN-1862](https://linear.app/bes/issue/RN-1862/consolidate-hierarchy-to-parent-id-on-project-specific-entities) will remove `entity_parent_child_relation` entirely and consolidate hierarchy onto `entity.parent_id`. For RN-1853, the existing relation rows continue to work as-is during the transition; the NULL / NOT-NULL `project_id` distinction lives on `entity` rows, not on the relation rows themselves.

**Q15. Concrete query to identify "which projects does an entity belong to".**

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
- **26,532 (15%)** are orphans (no `entity_parent_child_relation` entry pointing at any project's hierarchy) → assigned to the **explore** project per Q1 with `metadata.orphaned = true`

Estimated post-migration row count: ~287k sub-country entities (~1.6× current 182k), in line with Q7's "roughly 2×" estimate.

**Q16. `survey_response.entity_id` re-pointing.**

Lookup chain: `survey_response.survey_id → survey.project_id`. Every survey has a `project_id` set (0 NULL), so every response has a deterministic project — no legacy un-mapped case to handle.

Standard re-point (99.99% of cases): for each `survey_response` whose `entity_id` points at a sub-country entity, find the per-project copy where `entity.code` matches AND `entity.project_id = survey.project_id`, and update `survey_response.entity_id` to that copy.

Validation against prod data — out of 397,584 responses pointing at sub-country entities:
- **397,540 (99.99%)** — survey's project IS in entity's hierarchy → clean re-point
- **24 responses** — survey's project NOT in entity's hierarchy (pre-existing data anomaly)
- **20 responses** — entity has no project mapping at all (orphan entity)

Anomalies (44 total) get re-pointed to the **explore-project** copy of the entity, marked with `metadata.migrated_from_orphan_response = true` for later audit.
