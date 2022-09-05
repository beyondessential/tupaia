/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { DhisApi, DHIS2_RESOURCE_TYPES } from '@tupaia/dhis-api';
import { FetchReportQuery } from '../../types';
import { ReqContext } from '../context';
import ELEMENT_NAMES from './data/palauNursingSurgicalWardReport.json';

const codesUsingCategories = [
  'PW_SW01_5_PW_SW01_6',
  'PW_SW01_7_PW_SW01_8',
  'PW_SW01_9_PW_SW01_10',
  'PW_SW01_11_PW_SW01_12',
  'PW_SW01_15_PW_SW01_16',
  'PW_SW01_17_PW_SW01_18',
  'PW_SW01_19_PW_SW01_20',
  'PW_SW01_21_PW_SW01_22',
  'PW_SW01_25_PW_SW01_26',
  'PW_SW01_27_PW_SW01_28',
  'PW_SW01_29_PW_SW01_30',
  'PW_SW01_31_PW_SW01_32',
];

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

const getDataElementName = (code: string, category: string) => {
  const codeToName: Record<string, string> = ELEMENT_NAMES[0];

  if (codesUsingCategories.includes(code)) {
    const [, categoryWithoutPrefix] = category.split('_');
    return `${codeToName[code]} (${categoryWithoutPrefix})`;
  }
  return codeToName[code];
};

const getFacilityName = (code: string, facilities: Record<string, string>[]) => {
  const facility = facilities.find(f => f.code === code);
  if (!facility) {
    return 'Facility name not found';
  }
  return facility.name;
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

  const initialValue: Record<string, string>[] = [];
  const rows = dataValues.reduce((previous, current) => {
    const {
      dataElement: dataElementId,
      organisationUnit: organisationUnitId,
      period,
      categoryOptionCombo: categoryId,
      value,
    } = current;
    const updatedResults = [...previous];

    const dataElementCode = dictionary.dataElements[dataElementId];
    const dataElementCategory = dictionary.categories[categoryId];
    const dataElement = getDataElementName(dataElementCode, dataElementCategory);
    const organisationUnitCode = dictionary.orgUnits[organisationUnitId];
    const organisationUnitName = getFacilityName(organisationUnitCode, facilities);

    const orgUnitAndPeriodExists = (element: Record<string, string>) =>
      element.period === period && element['Facility code'] === organisationUnitCode;

    const index = previous.findIndex(orgUnitAndPeriodExists);

    if (index < 0) {
      updatedResults.push({
        [dataElement]: value,
        'Facility code': organisationUnitCode,
        'Facility name': organisationUnitName,
        period,
      });
      return updatedResults;
    }

    updatedResults[index][dataElement] = value;

    return updatedResults;
  }, initialValue);

  const columns = Object.values(ELEMENT_NAMES[0]).map(value => {
    return { key: value, title: value };
  });

  return { columns, rows };
};
