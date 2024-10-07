/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ImportValidationError, getCountryCode } from '@tupaia/utils';
import { getEntityObjectValidator } from './getEntityObjectValidator';
import { getOrCreateParentEntity } from './getOrCreateParentEntity';
import { getEntityMetadata } from './getEntityMetadata';

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

export async function updateCountryEntities(
  transactingModels,
  countryName,
  entityObjects,
  pushToDhis = true,
) {
  const countryCode = getCountryCode(countryName);
  const country = await transactingModels.country.findOrCreate(
    { name: countryName },
    { code: countryCode },
  );
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
  );

  await transactingModels.entity.findOrCreate(
    { code: countryCode },
    {
      name: countryName,
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
      new ImportValidationError(message, excelRowNumber, field, countryName);
    await validator.validate(entityObject, constructImportValidationError);
    const {
      code,
      name,
      image_url: imageUrl,
      longitude,
      latitude,
      geojson,
      data_service_entity: dataServiceEntity,
      type_name: typeName,
      screen_bounds: screenBounds,
      category_code: categoryCode,
      facility_type: facilityType,
      attributes,
    } = entityObject;
    if (codes.includes(code)) {
      throw new ImportValidationError(
        `Entity code '${code}' is not unique`,
        excelRowNumber,
        'code',
        countryName,
      );
    }
    codes.push(code);
    const { parentGeographicalArea, parentEntity } =
      (await getOrCreateParentEntity(transactingModels, entityObject, country, pushToDhis)) || {};
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
    );
    await transactingModels.entity.updateOrCreate(
      { code },
      {
        name,
        parent_id: parentEntity ? parentEntity.id : null,
        type: entityType,
        country_code: country.code,
        image_url: imageUrl,
        metadata: entityMetadata,
      },
    );

    if (attributes !== undefined) {
      await transactingModels.entity.updateEntityAttributes(code, attributes);
    }
    if (longitude && latitude) {
      await transactingModels.entity.updatePointCoordinates(code, { longitude, latitude });
    }
    if (screenBounds) {
      await transactingModels.entity.updateBoundsCoordinates(code, screenBounds);
    }
    if (geojson) {
      const translatedGeojson =
        geojson.type === 'Polygon'
          ? { type: 'MultiPolygon', coordinates: [geojson.coordinates] }
          : geojson;

      try {
        await transactingModels.entity.updateRegionCoordinates(code, translatedGeojson);
      } catch (error) {
        if (error.message.includes('payload string too long')) {
          const largeGeoEntities = entityObjects.filter(entityObject => {
            if (!entityObject?.geojson) return false;
            const geoJsonString = JSON.stringify(entityObject.geojson);
            // If the geo json is too large, we will hit the max payload size limit.
            // Hard postgres max is 8000 characters, but we need to account for other data in the query payload
            const maxGeoJsonPayload = 5200;
            if (geoJsonString.length > maxGeoJsonPayload) {
              return true;
            }
          });
          const text = largeGeoEntities.map(entity => entity.code).join(', ');
          error.message = `Error updating region coordinates for entities: ${text} ${error.message}`;
        }

        throw error;
      }
    }
  }
  return country;
}
