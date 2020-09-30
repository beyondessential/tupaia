/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

function getGeographicalAreaCode(name, country, district) {
  return `${district ? district.code : country.code}_${name.replace("'", '')}`;
}

export async function getOrCreateParentEntity(transactingModels, entityObject, country) {
  const {
    district: districtName,
    district_osm_id: districtOsmId,
    sub_district: subDistrictName,
    sub_district_osm_id: subDistrictOsmId,
    parent_code: parentCode,
  } = entityObject;
  const countryEntity = await transactingModels.entity.findOrCreate(
    { code: country.code },
    { name: `Unnamed country ${country.code}` },
  );

  let district;
  let districtEntity;
  let subDistrict;
  let subDistrictEntity;
  if (districtName) {
    const code = getGeographicalAreaCode(districtName, country);
    const districtObject = {
      name: districtName,
      country_id: country.id,
      code,
      level_code: 'district',
      level_name: 'District',
    };
    district = await transactingModels.geographicalArea.findOrCreate(districtObject);
    districtEntity = await transactingModels.entity.updateOrCreate(
      {
        code,
      },
      {
        name: districtName,
        type: transactingModels.entity.types.DISTRICT,
        parent_id: countryEntity.id,
        country_code: country.code,
        metadata: {
          dhis: { isDataRegional: true },
          openStreetMaps: { id: districtOsmId },
        },
      },
    );
  }
  if (subDistrictName) {
    const code = getGeographicalAreaCode(subDistrictName, country, districtEntity);
    const subDistrictObject = {
      name: subDistrictName,
      code,
      country_id: country.id,
      level_code: 'sub_district',
      level_name: 'Sub District',
    };
    const subDistrictEntityObject = {
      name: subDistrictName,
      type: transactingModels.entity.types.SUB_DISTRICT,
      parent_id: countryEntity.id,
      country_code: country.code,
      metadata: {
        dhis: { isDataRegional: true },
        openStreetMaps: { id: subDistrictOsmId },
      },
    };
    // If a district is also being added, use as the parent of the sub_district
    if (district.id) {
      subDistrictObject.parent_id = district.id;
      subDistrictEntityObject.parent_id = districtEntity.id;
    }
    subDistrict = await transactingModels.geographicalArea.findOrCreate(subDistrictObject);
    subDistrictEntity = await transactingModels.entity.updateOrCreate(
      {
        code,
      },
      subDistrictEntityObject,
    );
  }

  if (parentCode) {
    const parentEntity = await transactingModels.entity.findOne({ code: parentCode });
    if (!parentEntity) throw new Error(`No entity matching parent code ${parentCode}`);
    return { parentEntity };
  }
  // no explicit parent code provided, use either subdistrict or district as parent entity
  if (subDistrict) return { parentGeographicalArea: subDistrict, parentEntity: subDistrictEntity };
  if (district) return { parentGeographicalArea: district, parentEntity: districtEntity };
  throw new Error('No parent entity defined');
}
