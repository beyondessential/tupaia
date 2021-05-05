/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useQuery } from 'react-query';
import { utcMoment } from '@tupaia/utils';
import { post } from '../api';
import { useProjectEntitiesData } from './useEntitiesData';

const endDateFormat = 'YYYY-MM-DD';

const getParentOfType = (entities, rootEntityCode, type) => {
  const entity = entities.find(e => e.code === rootEntityCode);
  if (!entity) {
    return undefined;
  }
  if (entity.type === type) {
    return entity;
  }
  if (!entity.parentCode) {
    return undefined;
  }
  return getParentOfType(entities, entity.parentCode, type);
};
const getDecendantCodesOfType = (entities, rootEntityCode, type) => {
  const entity = entities?.find(e => e.code === rootEntityCode);
  if (!entity) {
    return [];
  }
  if (entity.type === type) {
    return [entity?.code];
  }
  if (!entity.childCodes || entity.type === 'country') {
    return [];
  }
  return entity.childCodes.map(c => getDecendantCodesOfType(entities, c, type)).flat();
};

const useReport = (entity, reportName, options, enabled) =>
  useQuery(
    [reportName, entity?.code, options],
    () => post(`report/${entity?.code}/${reportName}`, options),
    {
      staleTime: 1000 * 60 * 60 * 1,
      refetchOnWindowFocus: false,
      retry: 1,
      enabled: !!entity && enabled,
    },
  );

const useSchoolReport = entity =>
  useReport(
    entity,
    'LESMIS_school_vitals',
    { params: { endDate: utcMoment().format(endDateFormat) } },
    entity?.type === 'school',
  );

const useVillageReport = entity =>
  useReport(
    entity,
    'LESMIS_village_vitals',
    { params: { endDate: utcMoment().format(endDateFormat) } },
    entity?.type === 'village',
  );

const useDistrictReport = entity =>
  useReport(
    entity,
    'LESMIS_sub_district_vitals',
    { params: { endDate: utcMoment().format(endDateFormat) } },
    entity?.type === 'sub_district',
  );

const useMultiSchoolReport = (entities, rootEntity) => {
  const decendants = getDecendantCodesOfType(entities, rootEntity?.code, 'school');
  return useReport(
    rootEntity,
    'LESMIS_multi_school_vitals',
    {
      data: {
        endDate: utcMoment().format(endDateFormat),
        organisationUnitCodes: decendants.join(),
      },
    },
    decendants.length > 0,
  );
};

const useMultiDistrictReport = (entities, rootEntity) => {
  const decendants = getDecendantCodesOfType(entities, rootEntity?.code, 'sub_district');
  return useReport(
    rootEntity,
    'LESMIS_sub_district_vitals',
    {
      data: {
        endDate: utcMoment().format(endDateFormat),
        organisationUnitCodes: decendants.join(),
      },
    },
    decendants.length > 0,
  );
};

const useSchoolInformation = (entities, rootEntity) => {
  const parentVillage = getParentOfType(entities, rootEntity?.code, 'village');
  const parentDistrict = getParentOfType(entities, rootEntity?.code, 'sub_district');
  const { data: schoolData, isLoading: schoolLoading } = useSchoolReport(rootEntity);
  const { data: villageData, isLoading: villageLoading } = useVillageReport(parentVillage);
  const { data: districtData, isLoading: districtLoading } = useDistrictReport(parentDistrict);

  return {
    data: {
      ...schoolData?.results[0],
      parentVillage: { ...villageData?.results[0], ...parentVillage },
      parentDistrict: { ...districtData?.results[0], ...parentDistrict },
    },
    isLoading: schoolLoading || villageLoading || districtLoading,
  };
};

const useVillageInformation = (entities, rootEntity) => {
  const { data: villageData, isLoading: villageLoading } = useVillageReport(rootEntity);
  const { data: subSchoolsData, isLoading: subSchoolsLoading } = useMultiSchoolReport(
    entities,
    rootEntity,
  );

  return {
    data: {
      ...villageData?.results[0],
      ...subSchoolsData?.results[0],
    },
    isLoading: villageLoading || subSchoolsLoading,
  };
};

const useDistrictInformation = (entities, rootEntity) => {
  const parentProvince = getParentOfType(entities, rootEntity?.code, 'district');
  const { data: districtData, isLoading: districtLoading } = useDistrictReport(rootEntity);
  const { data: provinceData, isLoading: provinceLoading } = useMultiDistrictReport(
    entities,
    parentProvince,
  );
  const { data: subSchoolsData, isLoading: subSchoolsLoading } = useMultiSchoolReport(
    entities,
    rootEntity,
  );

  return {
    data: {
      ...districtData?.results[0],
      ...subSchoolsData?.results[0],
      parentProvince: { ...provinceData?.results[0], ...parentProvince },
    },
    isLoading: districtLoading || provinceLoading || subSchoolsLoading,
  };
};

const useProvinceInformation = (entities, rootEntity) => {
  const { data: provinceData, isLoading: provinceLoading } = useMultiDistrictReport(
    entities,
    rootEntity,
  );
  const { data: subSchoolsData, isLoading: subSchoolsLoading } = useMultiSchoolReport(
    entities,
    rootEntity,
  );

  return {
    data: {
      ...provinceData?.results[0],
      ...subSchoolsData?.results[0],
    },
    isLoading: provinceLoading || subSchoolsLoading,
  };
};

export const useVitalsData = entityCode => {
  const { data: entities = [], ...entitiesQuery } = useProjectEntitiesData();
  const entityData = entities.find(e => e.code === entityCode);

  const { data: schoolData, isLoading: schoolLoading } = useSchoolInformation(entities, entityData);
  const { data: villageData, isLoading: villageLoading } = useVillageInformation(
    entities,
    entityData,
  );
  const { data: districtData, isLoading: districtLoading } = useDistrictInformation(
    entities,
    entityData,
  );
  const { data: provinceData, isLoading: provinceLoading } = useProvinceInformation(
    entities,
    entityData,
  );

  return {
    ...entitiesQuery,
    ...entityData,

    ...schoolData,
    ...villageData,
    ...districtData,
    ...provinceData,

    isLoading: schoolLoading || villageLoading || districtLoading || provinceLoading,
  };
};
