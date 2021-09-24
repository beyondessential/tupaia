import keyBy from 'lodash.keyby';

import { CustomError } from '@tupaia/utils';
import { getMeasureBuilder } from '/apiV1/measureBuilders/getMeasureBuilder';
import { getDhisApiInstance } from '/dhis';
import { getDateRange, getAggregatePeriod } from './utils';
import { DataAggregatingRouteHandler } from './DataAggregatingRouteHandler';
import { MapOverlayPermissionsChecker } from './permissions';
import { DATA_SOURCE_TYPES } from './dataBuilders/dataSourceTypes';

const ADD_TO_ALL_KEY = '$all';

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
      'Measure data requested is restricted to a permission group the requesting user does not belong to.',
  },
};

/* Data arrives as an array of responses (one for each measure) containing an array of org
 * units. We need to rearrange it so that it's a 1D array of objects with the values
 * assigned to the appropriate keys, and replace the keys with the ids of the overlay
 * they came from (this is to avoid duplicate 'value' keys which causes a bug)
 *
 * measureDataResponsesByMeasureId: {
 *   measure_id_1: {
 *     data: [
 *       { organisationUnitCode: 'OrgA', measureZ: 0 },
 *       { organisationUnitCode: 'OrgB', measureZ: 1 },
 *     ],
 *     period: {
 *       latestAvailable: '20200301',
 *       earliestAvailable: '20190501',
 *       requested: '201901;201902;201903...',
 *     }
 *   }
 *   measure_id_2: {
 *     data: [
 *       { organisationUnitCode: 'OrgA', measureY: 100 },
 *       { organisationUnitCode: 'OrgB', measureY: -100 },
 *     ],
 *     period: {
 *       latestAvailable: '20200401',
 *       earliestAvailable: '20190501',
 *       requested: '201901;201902;201903...',
 *     }
 *   }
 * }
 *
 * measureData: [
 *  { organisationUnitCode: 'OrgA', measure_id_2: 100, measure_id_1: 0 },
 *  { organisationUnitCode: 'OrgB', measure_id_2: -100, measure_id_1: 1 },
 * ]
 * period: {
 *   latestAvailable: '20200401',
 *   earliestAvailable: '20190501',
 *   requested: '201901;201902;201903...',
 * }
 */
const buildMeasureData = (overlays, resultData) => {
  const measureDataResponsesByMeasureId = resultData.reduce((dataResponse, current) => ({
    ...dataResponse,
    ...current,
  }));
  const measureDataResponses = overlays.map(({ id, dataElementCode }) => {
    const { data } = measureDataResponsesByMeasureId[id];

    return data.map(obj => {
      const { [dataElementCode]: value, ...restData } = obj;
      return { [id]: value, ...restData };
    });
  });

  /**
   * measureDataResponses: [
   *     [
   *       { organisationUnitCode: 'OrgA', measure_id_1: 0 },
   *       { organisationUnitCode: 'OrgB', measure_id_1: 1 },
   *     ],
   *     [
   *       { organisationUnitCode: 'OrgA', measure_id_2: 100 },
   *       { organisationUnitCode: 'OrgB', measure_id_2: -100 },
   *     ],
   * ]
   */

  const measureDataByOrgUnit = {};
  // measureDataByOrgUnit: {
  //  OrgA: { organisationUnitCode: 'OrgA', measureY: 100, measure_id_1: 0 },
  //  OrgB: { organisationUnitCode: 'OrgB', measureY: -100, measure_id_1: 1 },
  // }

  // Using `forEach` instead of `reduce` with a spread operator on the accumulator
  // since it is much faster
  measureDataResponses.forEach(response => {
    response.forEach(dataItem => {
      const code = dataItem.organisationUnitCode;
      measureDataByOrgUnit[code] = { ...measureDataByOrgUnit[code], ...dataItem };
    });
  });

  return {
    measureData: Object.values(measureDataByOrgUnit),
    period: getAggregatePeriod(
      Object.values(measureDataResponsesByMeasureId).map(({ period }) => period),
    ),
  };
};

function getMostCommon(elements) {
  const counts = {};
  let candidate = null;

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

const getMeasureLevel = mapOverlays => {
  const aggregationTypes = mapOverlays.map(({ config }) => config.measureLevel);
  return [...new Set(aggregationTypes)].join(',');
};

export default class extends DataAggregatingRouteHandler {
  static PermissionsChecker = MapOverlayPermissionsChecker;

  buildResponse = async () => {
    const { code } = this.entity;
    const { measureId } = this.query;
    const measureIds = measureId.split(',');
    const overlayResults = await this.models.mapOverlay.find({ id: measureIds });

    // Re-order the overlays array to follow the order in measureIds
    const overlaysById = keyBy(overlayResults, 'id');
    const overlays = [];

    measureIds.forEach(id => {
      if (overlaysById[id]) {
        overlays.push(overlaysById[id]);
      }
    });

    // check permission
    await Promise.all(
      overlays.map(async ({ permission_group: permissionGroup }) => {
        const isUserAllowedMeasure = await this.req.userHasAccess(code, permissionGroup);
        if (!isUserAllowedMeasure) {
          throw new CustomError(accessDeniedForMeasure);
        }
      }),
    );
    // start fetching actual data
    const shouldFetchSiblings = this.query.shouldShowAllParentCountryResults === 'true';
    const responseData = await Promise.all(
      overlays.map(o => this.fetchMeasureData(o, shouldFetchSiblings)),
    );
    const { period, measureData } = buildMeasureData(overlays, responseData);
    const measureOptions = await this.fetchMeasureOptions(overlays, measureData);

    return {
      measureId: overlays
        .map(o => o.id)
        .sort()
        .join(','),
      measureLevel: getMeasureLevel(overlays),
      measureOptions,
      serieses: measureOptions,
      measureData,
      period,
    };
  };

  async fetchMeasureOptions(mapOverlays, measureData) {
    const measureOptions = await Promise.all(mapOverlays.map(o => this.fetchMeasureOption(o)));
    measureOptions
      .filter(mo => mo.displayedValueKey)
      .filter(mo => !mo.disableRenameLegend)
      .map(mo => updateLegendFromDisplayedValueKey(mo, measureData));

    const getOtherMeasureOptionKeys = mainMeasureOptionKey => {
      const otherLinkMeasureKeySet = new Set();
      measureData.forEach(data => {
        Object.keys(data).forEach(key => otherLinkMeasureKeySet.add(key));
      });
      otherLinkMeasureKeySet.delete('organisationUnitCode');
      otherLinkMeasureKeySet.delete(mainMeasureOptionKey);
      return Array.from(otherLinkMeasureKeySet);
    };

    // Config 'measureConfig' only works for report-server
    const { measureConfig, ...mainMeasureOption } = measureOptions[0];
    if (measureConfig) {
      const { [ADD_TO_ALL_KEY]: configForAllKeys, ...restOfConfig } = measureConfig;
      getOtherMeasureOptionKeys(mainMeasureOption.key)
        .filter(key => !key.includes('_metadata'))
        .forEach(key => {
          measureOptions.push({ ...configForAllKeys, key, name: key, ...restOfConfig[key] });
        });
      measureOptions[0] = mainMeasureOption;
    }
    return measureOptions;
  }

  async fetchMeasureOption(mapOverlay) {
    const {
      id,
      country_codes: countryCodes,
      groupName,
      permission_group: permissionGroup,
      isDataRegional, // don't include these in response
      dataElementCode,
      config,
      measureBuilderConfig,
      name,
      ...restOfMapOverlay
    } = await mapOverlay.getData();

    const {
      displayType,
      values,
      hideFromMenu,
      hideFromLegend,
      hideFromPopup,
      customLabel,
      ...restOfPresentationConfig
    } = config;

    const { dataSourceType = DATA_SOURCE_TYPES.SINGLE, periodGranularity } =
      measureBuilderConfig || {};
    const { startDate, endDate } = this.query;
    const dates = periodGranularity ? getDateRange(periodGranularity, startDate, endDate) : {};

    const baseOptions = {
      ...restOfPresentationConfig,
      ...restOfMapOverlay,
      name: customLabel ?? name,
      type: displayType,
      key: id,
      periodGranularity,
      hideFromMenu: hideFromMenu || false,
      hideFromLegend: hideFromLegend || false,
      hideFromPopup: hideFromPopup || false,
      ...dates,
    };

    if (values) {
      return { ...baseOptions, values };
    }
    // values have not been provided locally - fetch them from DHIS2
    const options =
      dataSourceType === DATA_SOURCE_TYPES.SINGLE
        ? await this.getOptionsForDataElement(mapOverlay, dataElementCode)
        : {};

    const translatedOptions = translateMeasureOptionSet(options, mapOverlay);

    return { ...baseOptions, values: translatedOptions };
  }

  async getOptionsForDataElement(mapOverlay, dataElementCode) {
    const dataServices = createDataServices(mapOverlay);
    const [dataElement] = await this.aggregator.fetchDataElements([dataElementCode], {
      organisationUnitCode: this.entityCode,
      dataServices,
      includeOptions: true,
    });

    if (!dataElement) {
      throw new Error(`Data element with code ${dataElementCode} not found`);
    }

    return dataElement.options;
  }

  async getCountryLevelOrgUnitCode() {
    const country = await this.entity.countryEntity();

    if (!country) {
      throw new CustomError(cannotFindCountryLevelInHierarchy);
    }

    return country.code;
  }

  async fetchMeasureData(mapOverlay, shouldFetchSiblings) {
    const {
      id,
      dataElementCode,
      isDataRegional,
      measureBuilderConfig,
      measureBuilder,
    } = mapOverlay;

    const entityCode = shouldFetchSiblings
      ? await this.getCountryLevelOrgUnitCode()
      : this.entity.code;
    const entity = await this.models.entity.findOne({ code: entityCode });
    const dataServices = createDataServices(mapOverlay);
    const dhisApi = getDhisApiInstance({ entityCode: this.entity.code, isDataRegional });
    dhisApi.injectFetchDataSourceEntities(this.fetchDataSourceEntities);
    const buildMeasure = async (measureId, ...args) => ({
      [measureId]: await getMeasureBuilder(measureBuilder)(...args),
    });

    return buildMeasure(
      id,
      this.models,
      this.aggregator,
      dhisApi,
      { ...this.query, dataElementCode },
      { ...measureBuilderConfig, dataServices },
      entity,
      this.req,
    );
  }
}

function translateMeasureOptionSet(measureOptions, mapOverlay) {
  const {
    config: { customColors, displayType },
  } = mapOverlay;

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
