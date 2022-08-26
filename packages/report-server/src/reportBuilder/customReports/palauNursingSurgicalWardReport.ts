/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { DhisApi, DHIS2_RESOURCE_TYPES } from '@tupaia/dhis-api';
import { FetchReportQuery } from '../../types';
import { ReqContext } from '../context';

const getCodesAndIds = async (dhisApi: DhisApi, ids: string[], type: string) => {
  const results = await dhisApi.getRecords({
    type,
    ids,
    codes: undefined,
    filter: undefined,
    fields: ['code', 'id', 'name'],
  });
  return results;
};

const idToCodeTranslator = async (
  dhisApi: DhisApi,
  data: Record<string, string>[],
  dhisDataType: string,
) => {
  const uniqueIds = new Set<string>();
  const typeWithoutPlural = dhisDataType.slice(0, dhisDataType.length - 1);
  data.forEach(event => uniqueIds.add(event[typeWithoutPlural]));
  const ids = [...uniqueIds];
  const codesAndIds: Record<string, string>[] = await getCodesAndIds(dhisApi, ids, dhisDataType);
  const idToCodeMap: Record<string, string> = {};
  codesAndIds.forEach(({ code, id }) => {
    idToCodeMap[id] = code;
  });
  return idToCodeMap;
};

const getDictionary = async (dhisApi: DhisApi, data: Record<string, string>[]) => {
  return {
    dataElements: await idToCodeTranslator(dhisApi, data, DHIS2_RESOURCE_TYPES.DATA_ELEMENT),
    orgUnits: await idToCodeTranslator(dhisApi, data, DHIS2_RESOURCE_TYPES.ORGANISATION_UNIT),
    categories: await idToCodeTranslator(dhisApi, data, DHIS2_RESOURCE_TYPES.CATEGORY_OPTION_COMBO),
  };
};

export const palauNursingSurgicalWardReport = async (
  reqContext: ReqContext,
  query: FetchReportQuery,
) => {
  const serverName = 'palau';
  const { PALAU_DHIS_API_URL: serverUrl } = process.env;
  const serverReadOnly = false;
  const dhisApi = new DhisApi(serverName, serverUrl, serverReadOnly);
  const { organisationUnitCodes: entityCodes, hierarchy } = query;

  const facilities: Record<
    string,
    string
  >[] = await reqContext.services.entity.getDescendantsOfEntities(hierarchy, entityCodes, {
    filter: { type: 'facility' },
  });

  const config = {
    dataSetCode: ['SW01'],
    organisationUnitCodes: facilities.map(f => f.code),
  };

  const aggregationType = 'RAW';
  const aggregationConfig = {};

  const dataValues: Record<string, string>[] = await dhisApi.getDataValuesInSets(
    config,
    aggregationType,
    aggregationConfig,
  );

  const dictionary = await getDictionary(dhisApi, dataValues);

  const results: Record<string, string>[] = [];
  dataValues.forEach((analytic: Record<string, string>) => {
    const {
      dataElement: dataElementId,
      organisationUnit: organisationUnitId,
      period,
      categoryOptionCombo: categoryId,
      value,
    } = analytic;

    results.push({
      dataElement: dictionary.dataElements[dataElementId],
      organisationUnit: dictionary.orgUnits[organisationUnitId],
      period,
      category: dictionary.categories[categoryId],
      value,
    });
  });

  return results;
};
