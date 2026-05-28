import { ImportValidationError } from '@tupaia/utils';
import { getEntityObjectValidator } from './getEntityObjectValidator';
import { getOrCreateParentEntity } from './getOrCreateParentEntity';
import { getEntityMetadata } from './getEntityMetadata';
import { resolvePolygonId } from './resolvePolygonId';

const DEFAULT_TYPE_NAMES = {
  1: 'Hospital',
  2: 'Community health centre',
  3: 'Clinic',
  4: 'Aid post',
};

function getDefaultTypeDetails(type) {
  const categoryCode = type.substring(0, 1);
  const typeName = DEFAULT_TYPE_NAMES[categoryCode];
  if (!typeName) {
    throw new Error(
      `${type} is not a valid facility type, must be one of ${Object.keys(DEFAULT_TYPE_NAMES).join(
        ', ',
      )}`,
    );
  }
  return { categoryCode, typeName };
}

async function attemptFacilityUpsert(
  transactingModels,
  {
    parentEntity,
    parentGeographicalArea,
    facilityType,
    typeName,
    categoryCode,
    code,
    name,
    country,
  },
) {
  if (!parentGeographicalArea) {
    console.warn(
      `Parent entity of facility has no geographical area, skipping facility creation for ${code}, parent entity code: ${parentEntity.code}`,
    );
    return;
  }
  const defaultTypeDetails = getDefaultTypeDetails(facilityType);
  const facilityToUpsert = {
    type: facilityType,
    type_name: typeName || undefined, // Ensure empty string is treated as undefined
    category_code: categoryCode || undefined, // Ensure empty string is treated as undefined
    code,
    name,
    geographical_area_id: parentGeographicalArea.id,
  };
  const newFacility = await transactingModels.facility.updateOrCreate(
    { code },
    { country_id: country.id, ...facilityToUpsert },
  );
  if (!newFacility.type_name) {
    newFacility.type_name = defaultTypeDetails.typeName;
  }
  if (!newFacility.category_code) {
    newFacility.category_code = defaultTypeDetails.categoryCode;
  }
  await newFacility.save();
}

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
  const codes = []; // An array to hold all facility codes, allowing duplicate checking

  for (let i = 0; i < entityObjects.length; i++) {
    const entityObject = entityObjects[i];
    const { entity_type: entityType } = entityObject;
    const validator = getEntityObjectValidator(entityType, transactingModels);
    const excelRowNumber = i + 2;
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
      type_name: typeName,
      screen_bounds: screenBounds,
      category_code: categoryCode,
      facility_type: facilityType,
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

    if (codes.includes(code)) {
      throw new ImportValidationError(
        `Entity code '${code}' is not unique`,
        excelRowNumber,
        'code',
        countryCode,
      );
    }
    codes.push(code);
    const { parentGeographicalArea, parentEntity } =
      (await getOrCreateParentEntity(
        transactingModels,
        entityObject,
        country,
        pushToDhis,
        projectId,
      )) || {};
    if (entityType === transactingModels.entity.types.FACILITY) {
      await attemptFacilityUpsert(transactingModels, {
        parentEntity,
        parentGeographicalArea,
        facilityType,
        typeName,
        categoryCode,
        code,
        name,
        country,
      });
    }
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

    await transactingModels.entity.updateOrCreate(
      { code, project_id: projectId },
      {
        name,
        parent_id: parentEntity ? parentEntity.id : null,
        type: entityType,
        country_code: country.code,
        image_url: imageUrl,
        metadata: entityMetadata,
        project_id: projectId,
        ...(entityPolygonId ? { entity_polygon_id: entityPolygonId } : {}),
      },
    );

    if (attributes !== undefined) {
      await transactingModels.entity.updateEntityAttributes(code, attributes);
    }
    if (longitude && latitude) {
      // xlsx cells arrive as strings (raw:false), but ST_GeomFromGeoJSON needs
      // numeric GeoJSON coordinates — coerce, and skip silently if either is
      // non-numeric rather than writing a broken point.
      const lon = Number(longitude);
      const lat = Number(latitude);
      if (Number.isFinite(lon) && Number.isFinite(lat)) {
        await transactingModels.entity.updatePointCoordinates(code, {
          longitude: lon,
          latitude: lat,
        });
      }
    }
    if (screenBounds) {
      await transactingModels.entity.updateBoundsCoordinates(code, screenBounds);
    }
  }
  return country;
}
