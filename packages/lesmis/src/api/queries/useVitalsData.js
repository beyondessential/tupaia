/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useQuery } from 'react-query';
import { get, post } from '../api';
import { useEntityData } from './useEntityData';
import { useEntitiesData } from './useEntitiesData';

const getParentOfType = (entities, rootEntityCode, type) => {
  const entity = entities.find(e => e.code === rootEntityCode);
  if (!entity) {
    return null;
  }
  if (entity.type === type) {
    return entity.code;
  }
  if (!entity.parentCode) {
    return null;
  }
  return getParentOfType(entities, entity.parentCode, type);
};
const getDecendantsOfType = (entities, rootEntityCode, type) => {
  const entity = entities.find(e => e.code === rootEntityCode);
  if (!entity) {
    return [];
  }
  if (entity.type === type) {
    return [entity.code];
  }
  if (!entity.childCodes) {
    return [];
  }
  return entity.childCodes.map(c => getDecendantsOfType(entities, c, type)).flat();
};

const useSchoolInformation = (entityCode, useHook) =>
  useQuery(
    ['vitals', 'school', entityCode],
    () =>
      get(`reportData/${entityCode}/LESMIS_school_vitals`, {
        params: { endDate: '2022-01-01' },
      }),
    {
      staleTime: 1000 * 60 * 60 * 1,
      refetchOnWindowFocus: false,
      retry: 1,
      enabled: useHook,
    },
  );

const useVillageInformation = (entityCode, useHook) =>
  useQuery(
    ['vitals', 'village', entityCode],
    () =>
      get(`reportData/${entityCode}/LESMIS_village_vitals`, {
        params: { endDate: '2022-01-01' },
      }),
    {
      staleTime: 1000 * 60 * 60 * 1,
      refetchOnWindowFocus: false,
      retry: 1,
      enabled: useHook,
    },
  );

const useDecendantSchoolInformation = (entities, entityCode, useHook) => {
  const decendants = getDecendantsOfType(entities, entityCode, 'school');
  return useQuery(
    ['vitals', 'multiSchool', entityCode],
    () =>
      post(`reportData/${entityCode}/LESMIS_multi_school_vitals`, {
        data: { endDate: '2022-01-01', organisationUnitCodes: decendants.join() },
      }),
    {
      staleTime: 1000 * 60 * 60 * 1,
      refetchOnWindowFocus: false,
      retry: 1,
      enabled: useHook && decendants.length > 0,
    },
  );
};

const useDistrictInformation = (entityCode, useHook) =>
  useQuery(
    ['vitals', 'subDistrict', entityCode],
    () =>
      get(`reportData/${entityCode}/LESMIS_sub_district_vitals`, {
        params: { endDate: '2022-01-01' },
      }),
    {
      staleTime: 1000 * 60 * 60 * 1,
      refetchOnWindowFocus: false,
      retry: 1,
      enabled: useHook,
    },
  );

const useDecendantDistrictInformation = (entities, entityCode, useHook) => {
  const decendants = getDecendantsOfType(entities, entityCode, 'sub_district');
  return useQuery(
    ['vitals', 'province', entityCode],
    () =>
      post(`reportData/${entityCode}/LESMIS_sub_district_vitals`, {
        data: { endDate: '2022-01-01', organisationUnitCodes: decendants.join() },
      }),
    {
      staleTime: 1000 * 60 * 60 * 1,
      refetchOnWindowFocus: false,
      retry: 1,
      enabled: useHook && decendants.length > 0,
    },
  );
};

export const useVitalsData = entityCode => {
  const { data: entities = [], ...entitiesQuery } = useEntitiesData();
  const entityData = entities.find(e => e.code === entityCode);

  // School: school / parent district / parent village
  // Village: village / sub schools
  // District: district / parent province / sub schools
  // Province: sub districts / sub schools
  // Country: sub schools
  const useHooks = {
    school: false,
    village: false,
    district: false,

    subSchools: false,
    subDistricts: false,

    parentVillage: false,
    parentDistrict: false,
    parentProvince: false,
  };

  switch (entityData?.type) {
    case 'school':
      useHooks.school = true;
      useHooks.parentVillage = true;
      useHooks.parentDistrict = true;
      break;
    case 'village':
      useHooks.village = true;
      useHooks.subSchools = true;
      break;
    case 'sub_district':
      useHooks.district = true;
      useHooks.subSchools = true;
      useHooks.parentProvince = true;
      break;
    case 'district':
      useHooks.subDistricts = true;
      useHooks.subSchools = true;
      break;
    case 'country':
      useHooks.subSchools = true;
      break;
    default:
      break;
  }

  const { data: schoolData } = useSchoolInformation(entityCode, useHooks.school);
  const { data: villageData } = useVillageInformation(entityCode, useHooks.village);
  const { data: districtData } = useDistrictInformation(entityCode, useHooks.district);

  const { data: subSchoolsData } = useDecendantSchoolInformation(
    entities,
    entityCode,
    useHooks.subSchools,
  );
  const { data: subDistrictData } = useDecendantDistrictInformation(
    entities,
    entityCode,
    useHooks.subDistricts,
  );

  const parentVillageCode = getParentOfType(entities, entityCode, 'village');
  const { data: parentVillageData } = useVillageInformation(
    parentVillageCode,
    useHooks.parentVillage,
  );
  const parentDistrictCode = getParentOfType(entities, entityCode, 'sub_district');
  const { data: parentDistrictData } = useDistrictInformation(
    parentDistrictCode,
    useHooks.parentDistrict,
  );
  const parentProvinceCode = getParentOfType(entities, entityCode, 'district');
  const { data: parentProvinceData } = useDecendantDistrictInformation(
    entities,
    parentProvinceCode,
    useHooks.parentProvince,
  );

  return {
    ...entitiesQuery,
    ...entityData,

    ...schoolData?.results[0],
    ...villageData?.results[0],
    ...districtData?.results[0],

    ...subSchoolsData?.results[0],
    ...subDistrictData?.results[0],

    parentVillage: { ...parentVillageData?.results[0], code: parentVillageCode },
    parentDistrict: { ...parentDistrictData?.results[0], code: parentDistrictCode },
    parentProvince: { ...parentProvinceData?.results[0], code: parentProvinceCode },
  };
};
