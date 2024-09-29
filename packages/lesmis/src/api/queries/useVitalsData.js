/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useQuery } from '@tanstack/react-query';
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

const getParentEntity = (entities, rootEntity) => {
  switch (rootEntity?.type) {
    case 'school':
      return getParentOfType(entities, rootEntity?.code, 'sub_district');
    case 'sub_district':
      return getParentOfType(entities, rootEntity?.code, 'district');
    default:
      return undefined;
  }
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

const vitalsReports = {
  country: 'lesmis_ctry_vitals',
  district: 'lesmis_prov_vitals',
  sub_district: 'lesmis_dist_vitals',
  school: 'lesmis_sch_vitals',
};

const useEntityReport = entity =>
  useReport(
    entity,
    vitalsReports[entity?.type],
    { params: { endDate: utcMoment().format(endDateFormat) } },
    entity !== undefined,
  );

const useEntityVitals = entity => {
  const { data: results, isInitialLoading: isLoading } = useEntityReport(entity);

  return {
    data: results?.data?.[0],
    isLoading,
  };
};

const getPartnersLogos = vitalsData => {
  const partners = Object.entries(vitalsData).filter(
    ([key, value]) => Object.keys(PARTNERS_LOGOS).includes(key) && value === true,
  );

  return partners.map(([key]) => `${PARTNERS_IMAGE_PATH}${PARTNERS_LOGOS[key]}`);
};

export const useVitalsData = entityCode => {
  const { data: entities = [], ...entitiesQuery } = useProjectEntitiesData();

  const { data: entityData } = useEntityData(entityCode);
  const parentEntityData = getParentEntity(entities, entityData);

  const { data: entityVitals, isLoading: entityVitalsLoading } = useEntityVitals(entityData);
  const { data: parentVitals, isLoading: parentVitalsLoading } = useEntityVitals(parentEntityData);

  const vitalsData = {
    ...entitiesQuery,
    ...entityData,
    ...entityVitals,
    parentVitals: {
      ...parentEntityData,
      ...parentVitals,
    },
  };

  const partners = getPartnersLogos(vitalsData);

  return {
    data: { ...vitalsData, partners },
    isLoading: entityVitalsLoading || parentVitalsLoading,
  };
};
