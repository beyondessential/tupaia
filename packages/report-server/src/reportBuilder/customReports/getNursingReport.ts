/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { DhisApi } from '@tupaia/dhis-api';
import { FetchReportQuery } from '../../types';
import { ReqContext } from '../context';
import { readNursingMetadataFile } from './readNursingMetadataFile';

interface Surveys {
  [dataSetCode: string]: SurveyMetadata;
}

interface SurveyMetadata {
  codesToName: Record<string, string>;
  codesUsingCategories: string[];
}

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
  const dhisResourceTypes = await dhisApi.getResourceTypes();
  return {
    dataElements: await idToCodeTranslator(dhisApi, data, dhisResourceTypes.DATA_ELEMENT),
    orgUnits: await idToCodeTranslator(dhisApi, data, dhisResourceTypes.ORGANISATION_UNIT),
    categories: await idToCodeTranslator(dhisApi, data, dhisResourceTypes.CATEGORY_OPTION_COMBO),
  };
};

const getDataElementName = (
  code: string,
  category: string,
  dataSetCode: string,
  surveys: Surveys,
) => {
  const { codesToName } = surveys[dataSetCode as keyof typeof surveys];

  const { codesUsingCategories: rawJson } = surveys[dataSetCode as keyof typeof surveys];

  const codesUsingCategories: string[] = [...rawJson];

  if (codesUsingCategories.length > 0 && codesUsingCategories.includes(code)) {
    const [, categoryWithoutPrefix] = category.split('_');
    return `${codesToName[code as keyof typeof codesToName]} (${categoryWithoutPrefix})`;
  }
  return codesToName[code as keyof typeof codesToName];
};

const getFacilityName = (code: string, facilities: Record<string, string>[]) => {
  const facility = facilities.find(f => f.code === code);
  if (!facility) {
    return 'Facility name not found';
  }
  return facility.name;
};

export const getNursingReport = async (
  reqContext: ReqContext,
  query: FetchReportQuery,
  dataSetCode: string,
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
    dataSetCode: [dataSetCode],
    organisationUnitCodes: facilities.map(f => f.code),
  };

  const aggregationType = 'RAW';
  const aggregationConfig = {};

  const dataValues: Record<string, string>[] = await dhisApi.getDataValuesInSets(
    config,
    aggregationType,
    aggregationConfig,
  );
  const surveys: Surveys = await readNursingMetadataFile();
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
    const dataElement = getDataElementName(
      dataElementCode,
      dataElementCategory,
      dataSetCode,
      surveys,
    );
    if (!dataElement) {
      return updatedResults;
    }
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

  const { codesToName } = surveys[dataSetCode as keyof typeof surveys];
  const columns = Object.values(codesToName).map(value => {
    return { key: value, title: value };
  });

  return { columns, rows };
};
