import { keyBy } from 'lodash.keyby';

import { createAggregator } from '@tupaia/aggregator';
import { CustomError } from '@tupaia/utils';
import { Aggregator } from '/aggregator';
import { getMeasureBuilder } from '/apiV1/measureBuilders/getMeasureBuilder';
import { getDhisApiInstance } from '/dhis';
import { DhisTranslationHandler, getDateRange } from './utils';
import { DATA_SOURCE_TYPES } from './dataBuilders/dataSourceTypes';

// NOTE: does not allow for actual number value measure, will be added when
// all binary are added as optionSet
const binaryOptionSet = [
  { name: 'Yes', value: 1 },
  { name: 'No', value: 0 },
];

const cannotFindCountryLevelInHierarchy = {
  type: 'Permission Error',
  responseStatus: 404,
  responseText: {
    status: 'Not Found',
    details: 'Cannot find country level in hierarchy',
  },
};

const accessDeniedForMeasure = {
  type: 'Permission Error',
  responseStatus: 403,
  responseText: {
    status: 'Permission Denied',
    details:
      'Measure data requested is restricted to a user group the requesting user does not belong to.',
  },
};

function compileMeasureData(dataToUpdate, measureDataResponse) {
  return measureDataResponse.reduce((state, current) => {
    const code = current.organisationUnitCode;
    const existingData = state[code];
    const updatedData = { ...existingData, ...current };
    return {
      ...state,
      [code]: updatedData,
    };
  }, dataToUpdate);
}

function getMostCommon(elements) {
  const counts = {};
  let candidate = null;

  // eslint-disable-next-line array-callback-return
  elements.forEach(element => {
    const freq = (counts[element] || 0) + 1;
    counts[element] = freq;

    if (freq > (counts[candidate] || 0)) {
      candidate = element;
    }
  });

  return candidate;
}

// displayedValueKey allows elements to override their actual displayed value --
// in some cases, these elements doing the overriding outnumber the elements using
// that value's defined label. In those cases, we want to show the most commonly
// overridden value on the legend, rather than the default value.
function updateLegendFromDisplayedValueKey(measureOption, dataElements) {
  // Update the value in-place as in this case it's much cleaner
  // eslint-disable-next-line no-param-reassign
  measureOption.values = measureOption.values.map(({ name, value, ...rest }) => {
    const matchingElements = dataElements
      // use a weakly typed comparison here to match how the frontend does it
      .filter(e => e[measureOption.key] == value) // eslint-disable-line eqeqeq
      .map(e => e[measureOption.displayedValueKey]);
    return { name: getMostCommon(matchingElements) || name, value, ...rest };
  });
}

const createDataServices = mapOverlay => {
  const { isDataRegional } = mapOverlay;
  return [{ isDataRegional }];
};

export default class extends DhisTranslationHandler {
  buildData = async req => {
    const { entity, overlays } = this;
    const { code } = entity;
    const { query } = req;
    // check permission
    await Promise.all(
      overlays.map(async ({ userGroup }) => {
        const isUserAllowedMeasure = await req.userHasAccess(code, userGroup);
        if (!isUserAllowedMeasure) {
          throw new CustomError(accessDeniedForMeasure);
        }
      }),
    );

    // start fetching options
    const optionsTasks = overlays.map(o => this.fetchMeasureOptions(o, query));

    // start fetching actual data
    const shouldFetchSiblings = query.shouldShowAllParentCountryResults === 'true';
    const dataTasks = overlays.map(o => this.fetchMeasureData(o, shouldFetchSiblings, query));

    // wait for fetches to complete
    const measureOptions = await Promise.all(optionsTasks);
    const measureDataResponses = await Promise.all(dataTasks);

    // Data arrives as an array of responses (one for each measure) containing an array of org
    // units. We need to rearrange it so that it's a 1D array of objects with the values
    // assigned to the appropriate keys.
    //
    // RESPONSE: [
    //  [
    //    { organisationUnitCode: 'OrgA', measureZ: 0 },
    //    { organisationUnitCode: 'OrgB', measureZ: 1 }
    //  ],
    //  [
    //    { organisationUnitCode: 'OrgA', measureY: 100 },
    //    { organisationUnitCode: 'OrgB', measureY: -100 }
    //  ],
    // ]
    //
    // COMPILED: {
    //  OrgA: { organisationUnitCode: 'OrgA', measureY: 100, measureZ: 0 },
    //  OrgB: { organisationUnitCode: 'OrgB', measureY: -100, measureZ: 1 },
    // }
    //
    // RETURN: [
    //  { organisationUnitCode: 'OrgA', measureY: 100, measureZ: 0 },
    //  { organisationUnitCode: 'OrgB', measureY: -100, measureZ: 1 },
    // ]
    const measureDataByOrgId = measureDataResponses.reduce(compileMeasureData, {});
    const measureData = Object.values(measureDataByOrgId);

    measureOptions
      .filter(mo => mo.displayedValueKey)
      .map(mo => updateLegendFromDisplayedValueKey(mo, measureData));

    return {
      measureId: overlays.map(o => o.id).join(','),
      measureOptions,
      measureData,
    };
  };

  async fetchMeasureOptions(mapOverlay, query) {
    const {
      id,
      groupName,
      userGroup,
      isDataRegional, // don't include these in response
      dataElementCode,
      displayType,
      values,
      presentationOptions,
      measureBuilderConfig,
      ...restOfMapOverlay
    } = mapOverlay;

    const { dataSourceType = DATA_SOURCE_TYPES.SINGLE, periodGranularity } =
      measureBuilderConfig || {};
    const dates = periodGranularity
      ? getDateRange(periodGranularity, query.startDate, query.endDate)
      : {};

    const baseOptions = {
      ...presentationOptions,
      ...restOfMapOverlay,
      type: displayType,
      key: dataElementCode,
      periodGranularity,
      ...dates,
    };

    if (values) {
      return { ...baseOptions, values };
    }
    // values have not been provided locally - fetch them from DHIS2
    const { code } = this.entity;
    const dhisApi = getDhisApiInstance({ entityCode: code, isDataRegional });
    const options =
      dataSourceType === DATA_SOURCE_TYPES.SINGLE
        ? await getOptionsForDataElement(dhisApi, dataElementCode, createDataServices(mapOverlay))
        : {};
    const translatedOptions = translateMeasureOptionSet(options, mapOverlay);

    return { ...baseOptions, values: translatedOptions };
  }

  async getCountryLevelOrgUnitCode() {
    const country = await this.entity.getCountry();

    if (!country) {
      throw new CustomError(cannotFindCountryLevelInHierarchy);
    }

    return country.code;
  }

  async fetchMeasureData(mapOverlay, shouldFetchSiblings, query) {
    const { dataElementCode, isDataRegional, measureBuilderConfig, measureBuilder } = mapOverlay;
    const organisationUnitGroupCode = shouldFetchSiblings
      ? await this.getCountryLevelOrgUnitCode()
      : this.entity.code;
    const aggregator = createAggregator(Aggregator);
    const dataServices = createDataServices(mapOverlay);
    const dhisApi = getDhisApiInstance({ entityCode: this.entity.code, isDataRegional });
    const buildMeasure = getMeasureBuilder(measureBuilder);

    return buildMeasure(
      aggregator,
      dhisApi,
      { ...query, organisationUnitGroupCode, dataElementCode },
      { ...measureBuilderConfig, dataServices },
    );
  }
}

function translateMeasureOptionSet(measureOptions, mapOverlay) {
  const { customColors, displayType } = mapOverlay;

  if (!measureOptions) {
    // don't auto-assign options to radius measures
    if (displayType === 'radius') return [];
    return binaryOptionSet;
  }

  const colorArray = (customColors || '').split(',').filter(x => x);

  return Object.entries(measureOptions).map(([value, name], i) => {
    const color = colorArray[i];
    return { name, value, color };
  });
}

const getOptionsForDataElement = async (aggregator, dataElementCode, dataServices) => {
  const [dataElement] =
    (await aggregator.fetchDataElements([dataElementCode], {
      organisationUnitCode: this.entityCode,
      dataServices,
    })) || [];
  if (!dataElement) {
    throw new Error(`Data element with code ${dataElementCode} not found`);
  }

  return dataElement.options;
};
