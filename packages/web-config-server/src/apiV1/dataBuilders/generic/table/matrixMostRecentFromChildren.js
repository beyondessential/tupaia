import { asynchronouslyFetchValuesForObject } from '@tupaia/utils';
import {
  getDataElementsInGroup,
  getDataElementsInGroupSet,
  getChildOrganisationUnits,
  mapOrgUnitToGroupCodes,
} from '/apiV1/utils';
import { buildCategories } from './buildCategories';

export const matrixMostRecentFromChildren = async (
  { models, dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const {
    dataElementGroupSet,
    dataElementGroup,
    dataServices,
    optionSetCode,
    organisationUnitType,
  } = dataBuilderConfig;

  const fetchedData = await asynchronouslyFetchValuesForObject({
    organisationUnits: () =>
      getChildOrganisationUnits(models, entity, organisationUnitType, dhisApi),
    dataElementsInfo: () => getDataElementsInGroup(dhisApi, dataElementGroup, true),
    categoryMapping: () => getDataElementsInGroupSet(dhisApi, dataElementGroupSet, true),
    optionSetOptions: () => dhisApi.getOptionSetOptions({ code: optionSetCode }),
  });

  const { organisationUnits, categoryMapping, dataElementsInfo, optionSetOptions } = fetchedData;

  const orgUnitToGroupKeys = mapOrgUnitToGroupCodes(organisationUnits);

  const dataElementCodes = Object.keys(dataElementsInfo);
  const { results } = await aggregator.fetchAnalytics(dataElementCodes, { dataServices }, query, {
    aggregationType: aggregator.aggregationTypes.MOST_RECENT_PER_ORG_GROUP,
    aggregationConfig: { orgUnitToGroupKeys },
  });
  const returnJson = {};

  // build columns and rows
  returnJson.columns = buildColumns(organisationUnits);
  const categories = buildCategories(categoryMapping.dataElementGroups);
  returnJson.rows = [
    ...buildRows(
      results,
      dataElementsInfo,
      categoryMapping.dataElementToGroupMapping,
      optionSetOptions,
    ),
    ...categories,
  ];

  return returnJson;
};

const buildRows = (results, dataElementsInfo, dataElementToGroupMapping, optionSetOptions) => {
  const returnDataJson = {};
  results.forEach(({ dataElement: dataElementCode, organisationUnit, value }) => {
    if (!returnDataJson[dataElementCode]) {
      returnDataJson[dataElementCode] = {
        dataElement: dataElementsInfo[dataElementCode].name,
        categoryId: dataElementToGroupMapping[dataElementCode],
      };
    }
    returnDataJson[dataElementCode][organisationUnit] = optionSetOptions[value];
  });
  return Object.values(returnDataJson).sort((a, b) => a.dataElement.localeCompare(b.dataElement));
};

const buildColumns = organisationUnits =>
  organisationUnits.map(organisationUnit => ({
    key: organisationUnit.code,
    title: organisationUnit.name,
  }));
