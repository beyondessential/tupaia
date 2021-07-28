/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useQuery } from 'react-query';
import { utcMoment } from '@tupaia/utils';
import { post } from '../api';
import { useProjectEntitiesData } from './useEntitiesData';
import { useEntityData } from './useEntityData';

const PARTNERS_LOGOS = {
  AEAL: 'AEAL.jpg',
  CRS: 'CRS.jpg',
  DFAT: 'DFAT.png',
  GIZ: 'GIZ.jpg',
  HII: 'HII.png',
  Plan: 'Plan.png',
  RtR: 'RtR.jpg',
  unesco: 'unesco.jpg',
  UNICEF: 'UNICEF.png',
  VHS: 'VHS.png',
  WB: 'WB.jpg',
  WC: 'WC.png',
  WFP: 'WFP.jpeg',
  WR: 'WR.png',
  WV: 'WV.png',
};

const PARTNERS_IMAGE_PATH = '/images/partnerLogos/';

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
const getDescendantCodesOfType = (entities, rootEntityCode, type) => {
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
  return entity.childCodes.map(c => getDescendantCodesOfType(entities, c, type)).flat();
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

const useDistrictReport = entity =>
  useReport(
    entity,
    'LESMIS_sub_district_vitals',
    { params: { endDate: utcMoment().format(endDateFormat) } },
    entity?.type === 'sub_district',
  );

const useMultiSchoolReport = (entities, rootEntity) => {
  const descendants = getDescendantCodesOfType(entities, rootEntity?.code, 'school');
  return useReport(
    rootEntity,
    'LESMIS_multi_school_vitals',
    {
      params: {
        endDate: utcMoment().format(endDateFormat),
      },
    },
    descendants.length > 0,
  );
};

const useMultiDistrictReport = (entities, rootEntity) => {
  const descendants = getDescendantCodesOfType(entities, rootEntity?.code, 'sub_district');
  return useReport(
    rootEntity,
    'LESMIS_sub_district_vitals',
    {
      params: {
        endDate: utcMoment().format(endDateFormat),
      },
    },
    descendants.length > 0,
  );
};

const useSchoolInformation = (entities, rootEntity) => {
  const parentDistrict = getParentOfType(entities, rootEntity?.code, 'sub_district');
  const { data: schoolData, isLoading: schoolLoading } = useSchoolReport(rootEntity);
  const { data: districtData, isLoading: districtLoading } = useDistrictReport(parentDistrict);

  return {
    data: {
      ...schoolData?.results[0],
      parentDistrict: { ...districtData?.results[0], ...parentDistrict },
    },
    isLoading: schoolLoading || districtLoading,
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

const getPartnersLogos = vitalsData => {
  const partners =
    vitalsData.type && vitalsData.type === 'country'
      ? Object.entries(PARTNERS_LOGOS)
      : Object.entries(vitalsData).filter(
          ([key, value]) => Object.keys(PARTNERS_LOGOS).includes(key) && value === true,
        );

  return partners.map(([key]) => `${PARTNERS_IMAGE_PATH}${PARTNERS_LOGOS[key]}`);
};

export const useVitalsData = entityCode => {
  const { data: entities = [], ...entitiesQuery } = useProjectEntitiesData();
  const { data: entityData } = useEntityData(entityCode);

  const { data: schoolData, isLoading: schoolLoading } = useSchoolInformation(entities, entityData);
  const { data: districtData, isLoading: districtLoading } = useDistrictInformation(
    entities,
    entityData,
  );
  const { data: provinceData, isLoading: provinceLoading } = useProvinceInformation(
    entities,
    entityData,
  );

  const vitalsData = {
    ...entitiesQuery,
    ...entityData,
    ...schoolData,
    ...districtData,
    ...provinceData,
  };

  const partners = getPartnersLogos(vitalsData);

  return {
    data: { ...vitalsData, partners },
    isLoading: schoolLoading || districtLoading || provinceLoading,
  };
};
