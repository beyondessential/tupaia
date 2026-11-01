import { ImportValidationError } from '@tupaia/utils';

/**
 * Resolve an entity row's polygon reference to an `entity_polygon.id`.
 *
 * Two reference shapes are accepted, mirroring the GIS Data importer:
 *
 *   1. `entity_polygon_id` — rename-stable. This is what the new exporter
 *      always emits, so round-trips downloads → re-uploads always hit this
 *      path even if the polygon's code was edited after export.
 *   2. `entity_polygon_code` + `entity_polygon_data_source` — human-readable
 *      natural key. Useful for net-new uploads where the user has just
 *      uploaded polygons via the GIS Data page and knows the code +
 *      data_source they wrote in the GeoJSON, but doesn't know the
 *      auto-generated id.
 *
 * If both shapes are present they must resolve to the same polygon row;
 * mismatch is a row-level error so the user catches stale references on
 * re-import after a rename.
 *
 * @returns {Promise<string | null>} the resolved entity_polygon.id, or null
 * if no polygon reference is present.
 */
export const resolvePolygonId = async (
  transactingModels,
  { entityPolygonId, polygonCode, polygonDataSource, excelRowNumber, countryCode },
) => {
  const hasId = Boolean(entityPolygonId);
  const hasNaturalKey = Boolean(polygonCode) || Boolean(polygonDataSource);

  if (!hasId && !hasNaturalKey) return null;

  if (hasNaturalKey && (!polygonCode || !polygonDataSource)) {
    throw new ImportValidationError(
      'entity_polygon_code and entity_polygon_data_source must both be supplied together.',
      excelRowNumber,
      polygonCode ? 'entity_polygon_data_source' : 'entity_polygon_code',
      countryCode,
    );
  }

  let resolvedById = null;
  if (hasId) {
    resolvedById = await transactingModels.entityPolygon.findOne({ id: entityPolygonId });
    if (!resolvedById) {
      throw new ImportValidationError(
        `Unknown entity_polygon_id "${entityPolygonId}". Upload the polygon via the GIS Data page first, or use the entity_polygon_code + entity_polygon_data_source natural key.`,
        excelRowNumber,
        'entity_polygon_id',
        countryCode,
      );
    }
  }

  let resolvedByNaturalKey = null;
  if (hasNaturalKey) {
    resolvedByNaturalKey = await transactingModels.entityPolygon.findOne({
      code: polygonCode,
      data_source: polygonDataSource,
    });
    if (!resolvedByNaturalKey) {
      throw new ImportValidationError(
        `No entity_polygon found for code "${polygonCode}" and data_source "${polygonDataSource}". Upload the polygon via the GIS Data page first.`,
        excelRowNumber,
        'entity_polygon_code',
        countryCode,
      );
    }
  }

  if (resolvedById && resolvedByNaturalKey && resolvedById.id !== resolvedByNaturalKey.id) {
    throw new ImportValidationError(
      `entity_polygon_id "${entityPolygonId}" does not match the polygon found by code "${polygonCode}" / data_source "${polygonDataSource}". Remove one or fix the mismatch.`,
      excelRowNumber,
      'entity_polygon_id',
      countryCode,
    );
  }

  return (resolvedById ?? resolvedByNaturalKey).id;
};
