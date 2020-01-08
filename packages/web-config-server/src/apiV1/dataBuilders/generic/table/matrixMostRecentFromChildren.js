import {
  asynchronouslyFetchValuesForObject,
  getDataElementsInGroup,
  getDataElementsInGroupSet,
  getOptionSetOptions,
  getChildOrganisationUnits,
  mapFacilityToOrgUnitIds,
} from '/apiV1/utils';
import { AGGREGATION_TYPES } from '/dhis';
import { buildCategories } from './buildCategories';

const { MOST_RECENT_PER_ORG_GROUP } = AGGREGATION_TYPES;

export const matrixMostRecentFromChildren = async ({ dataBuilderConfig, query }, dhisApi) => {
  const {
    dataElementGroupSet,
    dataElementGroup,
    optionSetCode,
    organisationUnitLevel,
  } = dataBuilderConfig;

  const { organisationUnitCode } = query;

  const fetchedData = await asynchronouslyFetchValuesForObject({
    organisationUnits: () =>
      getChildOrganisationUnits(
        {
          organisationUnitGroupCode: organisationUnitCode,
          level: organisationUnitLevel,
        },
        dhisApi,
      ),
    dataElementsInfo: () => getDataElementsInGroup(dhisApi, dataElementGroup),
    categoryMapping: () => getDataElementsInGroupSet(dhisApi, dataElementGroupSet),
    optionSetOptions: () => getOptionSetOptions(dhisApi, { code: optionSetCode }),
  });

  const { organisationUnits, categoryMapping, dataElementsInfo, optionSetOptions } = fetchedData;

  const facilityIdsToOrgUnitKeys = mapFacilityToOrgUnitIds(organisationUnits);

  const { results } = await dhisApi.getAnalytics(
    dataBuilderConfig,
    query,
    MOST_RECENT_PER_ORG_GROUP,
    { facilityIdsToOrgUnitKeys },
  );
  const returnJson = {};

  // build columns and rows
  returnJson.columns = buildColumns(organisationUnits);
  returnJson.categories = buildCategories(categoryMapping.dataElementGroups);
  returnJson.rows = buildRows(
    results,
    dataElementsInfo,
    categoryMapping.dataElementToGroupMapping,
    optionSetOptions,
  );
  return returnJson;
};

const buildRows = (results, dataElementsInfo, dataElementToGroupMapping, optionSetOptions) => {
  const returnDataJson = {};
  results.forEach(({ dataElement: dataElementId, organisationUnit, value }) => {
    if (!returnDataJson[dataElementId]) {
      returnDataJson[dataElementId] = {
        dataElement: dataElementsInfo[dataElementId].name,
        categoryId: dataElementToGroupMapping[dataElementId],
      };
    }
    returnDataJson[dataElementId][organisationUnit] = optionSetOptions[value];
  });
  return Object.values(returnDataJson).sort((a, b) => a.dataElement.localeCompare(b.dataElement));
};

const buildColumns = organisationUnits =>
  organisationUnits.map(organisationUnit => ({
    key: organisationUnit.id,
    title: organisationUnit.name,
  }));
