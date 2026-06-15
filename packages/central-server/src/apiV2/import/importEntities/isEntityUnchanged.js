const normaliseString = value => (value === null || value === undefined ? '' : String(value));

// Canonical form of a flat attribute object for comparison: sorted keys, values
// stringified. Stringifying means a stored boolean `true` and an imported string
// `"true"` compare equal, so a round-trip doesn't churn those rows. An empty or
// missing object canonicalises to '' so `{}`, null and undefined all match.
const canonicalObject = value => {
  if (value === null || value === undefined) return '';
  const entries = Object.entries(value);
  if (entries.length === 0) return '';
  return JSON.stringify(
    entries
      .map(([key, val]) => [key, val === null || val === undefined ? '' : String(val)])
      .sort(([a], [b]) => a.localeCompare(b)),
  );
};

/**
 * True only when re-importing this row would change nothing, so the importer can
 * skip all of its per-row work (the common "edit a few rows, re-import the whole
 * sheet" case). `existing` is the pre-loaded current state (see
 * loadExistingEntities). Conservative by design: anything that can't be cheaply
 * compared here counts as changed, so a real update is never skipped.
 */
export const isEntityUnchanged = (row, existing) => {
  if (!existing) return false; // new entity

  if (normaliseString(row.name) !== normaliseString(existing.name)) return false;
  if (normaliseString(row.entity_type) !== normaliseString(existing.type)) return false;
  if (normaliseString(row.country_code) !== normaliseString(existing.country_code)) return false;
  if (normaliseString(row.parent_code) !== normaliseString(existing.parent_code)) return false;
  if (normaliseString(row.image_url) !== normaliseString(existing.image_url)) return false;

  // Point coordinates — only written when the row supplies both, so only diffed then.
  const hasCoordinates =
    row.longitude !== undefined &&
    row.longitude !== '' &&
    row.latitude !== undefined &&
    row.latitude !== '';
  if (hasCoordinates) {
    if (Number(row.longitude) !== existing.longitude || Number(row.latitude) !== existing.latitude) {
      return false;
    }
  }

  // attributes / data_service_entity — only written (and so only diffed) when supplied.
  if (
    row.attributes !== undefined &&
    canonicalObject(row.attributes) !== canonicalObject(existing.attributes)
  ) {
    return false;
  }
  if (
    row.data_service_entity !== undefined &&
    canonicalObject(row.data_service_entity) !== canonicalObject(existing.data_service_config)
  ) {
    return false;
  }

  // Polygon link — compare only when referenced by id. A code/data_source ref or
  // screen_bounds needs resolution we don't do here, so treat as changed.
  if (row.entity_polygon_id) {
    if (normaliseString(row.entity_polygon_id) !== normaliseString(existing.entity_polygon_id)) {
      return false;
    }
  } else if (row.entity_polygon_code || row.entity_polygon_data_source) {
    return false;
  }
  if (row.screen_bounds) return false;

  return true;
};
