/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useQuery } from 'react-query';
import { get, post } from '../api';
import { useEntityData } from './useEntityData';
import { useEntitiesData } from './useEntitiesData';

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

const useSchoolInformation = entityCode =>
  useQuery(
    ['vitals', 'school', entityCode],
    () =>
      get(`reportData/${entityCode}/LESMIS_school_vitals`, {
        params: { endDate: '2021-01-01' },
      }),
    {
      staleTime: 1000 * 60 * 60 * 1,
      refetchOnWindowFocus: false,
      retry: 1,
      enabled: true,
    },
  );

const useDecendantSchoolInformation = (entities, entityCode) => {
  const decendants = getDecendantsOfType(entities, entityCode, 'school');
  return useQuery(
    ['vitals', 'multiSchool', entityCode],
    () =>
      post(`reportData/${entityCode}/LESMIS_multi_school_vitals`, {
        data: { endDate: '2021-01-01', organisationUnitCodes: decendants.join() },
      }),
    {
      staleTime: 1000 * 60 * 60 * 1,
      refetchOnWindowFocus: false,
      retry: 1,
      enabled: decendants.length > 0,
    },
  );
};

const useDistrictInformation = entityCode =>
  useQuery(
    ['vitals', 'subDistrict', entityCode],
    () =>
      get(`reportData/${entityCode}/LESMIS_sub_district_vitals`, {
        params: { endDate: '2021-01-01' },
      }),
    {
      staleTime: 1000 * 60 * 60 * 1,
      refetchOnWindowFocus: false,
      retry: 1,
      enabled: true,
    },
  );

const useDecendantDistrictInformation = (entities, entityCode) => {
  const decendants = getDecendantsOfType(entities, entityCode, 'sub_district');
  return useQuery(
    ['vitals', 'province', entityCode],
    () =>
      post(`reportData/${entityCode}/LESMIS_sub_district_vitals`, {
        data: { endDate: '2021-01-01', organisationUnitCodes: decendants.join() },
      }),
    {
      staleTime: 1000 * 60 * 60 * 1,
      refetchOnWindowFocus: false,
      retry: 1,
      enabled: decendants.length > 0,
    },
  );
};

export const useVitalsData = entityCode => {
  const { data: entities = [], ...entitiesQuery } = useEntitiesData();
  const entityData = entities.find(e => e.code === entityCode);
  const { data: schoolData } = useSchoolInformation(entityCode);
  const { data: districtData } = useDistrictInformation(entityCode);
  const { data: subSchoolsData } = useDecendantSchoolInformation(entities, entityCode);
  const { data: provinceData } = useDecendantDistrictInformation(entities, entityCode);
  return {
    ...entitiesQuery,
    ...schoolData?.results[0],
    ...districtData?.results[0],
    ...subSchoolsData?.results[0],
    ...provinceData?.results[0],
    ...entityData,
  };
};
