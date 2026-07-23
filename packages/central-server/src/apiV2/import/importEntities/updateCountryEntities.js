import { ImportValidationError } from '@tupaia/utils';
import { getEntityObjectValidator } from './getEntityObjectValidator';
import { getOrCreateParentEntity } from './getOrCreateParentEntity';
import { getEntityMetadata } from './getEntityMetadata';
import { resolvePolygonId } from './resolvePolygonId';
import { isEntityUnchanged } from './isEntityUnchanged';

/**
 * Apply a batch of entity rows that all share the same `country_code`.
 *
 * Caller (importEntities.js) is responsible for validating that the country
 * is in the active project's `project_country` list, so by the time we get
 * here the country exists in the `country` table.
 */
export async function updateCountryEntities(
  transactingModels,
  countryCode,
  entityObjects,
  pushToDhis = true,
  projectId = null,
  existingEntitiesByCode = new Map(),
) {
  const country = await transactingModels.country.findOne({ code: countryCode });
  if (!country) {
    // Defensive: caller should have rejected this row earlier, but if a
    // country row is missing from the `country` table the importer can't
    // create one without a name. Surface a clear error rather than silently
    // creating an unnamed country.
    throw new ImportValidationError(
      `Country with code "${countryCode}" not found in country table. Add it via the Countries admin page first.`,
    );
  }
  const { id: worldId } = await transactingModels.entity.findOne({
    type: transactingModels.entity.types.WORLD,
  });
  const defaultMetadata = {
    dhis: { dhisInstanceCode: 'regional' },
  };
  const countryEntityMetadata = await getEntityMetadata(
    transactingModels,
    defaultMetadata,
    countryCode,
    pushToDhis,
    projectId,
  );

  await transactingModels.entity.findOrCreate(
    { code: countryCode },
    {
      name: country.name,
      country_code: countryCode,
      type: transactingModels.entity.types.COUNTRY,
      parent_id: worldId,
      metadata: countryEntityMetadata,
    },
  );
  const codes = new Set(); // Track seen codes for O(1) duplicate checking

  for (let i = 0; i < entityObjects.length; i++) {
    const entityObject = entityObjects[i];
    const { entity_type: entityType } = entityObject;
    // Country entities are shared (project_id NULL) and already ensured above
    // per country_code. The export includes them for completeness, but they
    // must not be re-created as project-scoped rows here — skip them. (Country
    // creation/editing is handled via the Countries tab, not entity import.)
    if (entityType === transactingModels.entity.types.COUNTRY) {
      continue;
    }
    const excelRowNumber = i + 2;
    // Catch duplicate codes within the upload up front, so an accidental
    // duplicate line still errors even when a row would otherwise be skipped.
    if (codes.has(entityObject.code)) {
      throw new ImportValidationError(
        `Entity code '${entityObject.code}' is not unique`,
        excelRowNumber,
        'code',
        countryCode,
      );
    }
    codes.add(entityObject.code);
    // Skip rows that would change nothing — the common case is re-importing a
    // whole exported sheet after editing only a few rows. Unchanged rows cost no
    // per-row queries (resolution + writes below are all skipped).
    if (isEntityUnchanged(entityObject, existingEntitiesByCode.get(entityObject.code))) {
      continue;
    }
    const validator = getEntityObjectValidator(entityType, transactingModels);
    const constructImportValidationError = (message, field) =>
      new ImportValidationError(message, excelRowNumber, field, countryCode);
    await validator.validate(entityObject, constructImportValidationError);
    const {
      code,
      name,
      image_url: imageUrl,
      longitude,
      latitude,
      entity_polygon_id: rawEntityPolygonId,
      entity_polygon_code: polygonCode,
      entity_polygon_data_source: polygonDataSource,
      data_service_entity: dataServiceEntity,
      screen_bounds: screenBounds,
      attributes,
    } = entityObject;

    // Resolve the polygon link via id (rename-stable) or natural key
    // (human-readable). Inline geojson is no longer accepted — polygons live
    // in entity_polygon and must be uploaded via the GIS Data page first.
    const entityPolygonId = await resolvePolygonId(transactingModels, {
      entityPolygonId: rawEntityPolygonId,
      polygonCode,
      polygonDataSource,
      excelRowNumber,
      countryCode,
    });

    const { parentEntity } =
      (await getOrCreateParentEntity(
        transactingModels,
        entityObject,
        country,
        pushToDhis,
        projectId,
      )) || {};
    // Every sub-country entity must have a parent. Without this guard a row with
    // no parent_code (and no district/sub_district) would create an orphan or,
    // worse, wipe an existing entity's parent on update.
    if (!parentEntity) {
      throw new ImportValidationError(
        'Missing parent_code — every entity must have a parent',
        excelRowNumber,
        'parent_code',
        countryCode,
      );
    }
    // Note: facility classification (facility_type / type_name / category_code)
    // is no longer imported — it only wrote to the legacy `clinic` table, which
    // is deprecated (visuals read facility_type from entity.attributes now).
    if (dataServiceEntity) {
      const dataServiceEntityToUpsert = {
        entity_code: code,
        config: dataServiceEntity,
      };

      await transactingModels.dataServiceEntity.updateOrCreate(
        { entity_code: code },
        dataServiceEntityToUpsert,
      );
    }

    const entityMetadata = await getEntityMetadata(
      transactingModels,
      defaultMetadata,
      code,
      pushToDhis,
      projectId,
    );

    const entity = await transactingModels.entity.updateOrCreate(
      { code, project_id: projectId },
      {
        name,
        parent_id: parentEntity.id,
        type: entityType,
        country_code: country.code,
        image_url: imageUrl,
        metadata: entityMetadata,
        project_id: projectId,
        ...(entityPolygonId ? { entity_polygon_id: entityPolygonId } : {}),
      },
    );

    if (attributes !== undefined) {
      await transactingModels.entity.updateEntityAttributes(entity.id, attributes);
    }
    if (longitude && latitude) {
      const lon = Number(longitude);
      const lat = Number(latitude);
      if (Number.isFinite(lon) && Number.isFinite(lat)) {
        await transactingModels.entity.updatePointCoordinates(entity.id, {
          longitude: lon,
          latitude: lat,
        });
      }
    }
    // Sync the cached bounds with the linked polygon (so the map zooms to it).
    // Runs after point handling so a polygon wins over a point, but before
    // screenBounds so an explicit screen_bounds column still takes precedence.
    if (entityPolygonId) {
      await transactingModels.entity.updateBoundsFromPolygon(entity.id);
    }
    if (screenBounds) {
      await transactingModels.entity.updateBoundsCoordinates(entity.id, screenBounds);
    }
  }
  return country;
}
