/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { getCode as getCountryIsoCode } from 'countrynames';

import { ImportValidationError } from '@tupaia/utils';
import { getEntityObjectValidator } from './getEntityObjectValidator';
import { getOrCreateParentEntity } from './getOrCreateParentEntity';

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

function getCountryCode(countryName, entityObjects) {
  // Use the country ISO code if there's a direct match, otherwise base on the two letter facility
  // code prefix
  const country = getCountryIsoCode(countryName) || entityObjects[0].code.substring(0, 2);
  if (!country) throw new ImportValidationError(`${countryName} is not a recognised country`);
  return country;
}

export async function updateCountryEntities(transactingModels, countryName, entityObjects) {
  const countryCode = getCountryCode(countryName, entityObjects);
  const country = await transactingModels.country.findOrCreate(
    { name: countryName },
    { code: countryCode },
  );
  const { id: worldId } = await transactingModels.entity.findOne({
    type: transactingModels.entity.types.WORLD,
  });
  await transactingModels.entity.findOrCreate(
    { code: countryCode },
    {
      name: countryName,
      country_code: countryCode,
      type: transactingModels.entity.types.COUNTRY,
      parent_id: worldId,
      metadata: {
        dhis: { isDataRegional: true },
      },
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
      type_name: typeName,
      screen_bounds: screenBounds,
      category_code: categoryCode,
      facility_type: facilityType,
      attributes = {},
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
    const { parentGeographicalArea, parentEntity } = await getOrCreateParentEntity(
      transactingModels,
      entityObject,
      country,
    );
    if (entityType === transactingModels.entity.types.FACILITY) {
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
    await transactingModels.entity.updateOrCreate(
      { code },
      {
        name,
        parent_id: parentEntity.id,
        type: entityType,
        country_code: country.code,
        image_url: imageUrl,
        metadata: {
          dhis: { isDataRegional: true },
        },
        attributes,
      },
    );
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
      await transactingModels.entity.updateRegionCoordinates(code, translatedGeojson);
    }
  }
  return country;
}
