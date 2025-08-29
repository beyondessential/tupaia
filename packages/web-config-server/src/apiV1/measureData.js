import assert from 'assert';
import { snake } from 'case';
import { uniq } from 'es-toolkit';

import { CustomError } from '@tupaia/utils';
import { getMeasureBuilder } from '/apiV1/measureBuilders/getMeasureBuilder';
import { getDhisApiInstance } from '/dhis';
import { getDateRange, getAggregatePeriod } from './utils';
import { DataAggregatingRouteHandler } from './DataAggregatingRouteHandler';
import { MapOverlayPermissionsChecker } from './permissions';
import { DATA_SOURCE_TYPES } from './dataBuilders/dataSourceTypes';
import { reportServer } from './dataBuilders';

const ADD_TO_ALL_KEY = '$all';

// NOTE: does not allow for actual number value measure, will be added when
// all binary are added as optionSet
const binaryOptionSet = [
  { name: 'Yes', value: 1 },
  { name: 'No', value: 0 },
];

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
const buildMeasureData = (overlays = [], resultData) => {
  const measureDataResponsesByMeasureCode = resultData.reduce((dataResponse, current) => ({
    ...dataResponse,
    ...current,
  }));
  const measureDataResponses = overlays.map(
    ({ code, data_builder_config: measureBuilderConfig }) => {
      const { dataElementCode = 'value' } = measureBuilderConfig ?? {};
      const { data = [] } = measureDataResponsesByMeasureCode[code];

      // Rename the the value field from the dataElementCode to the measureCode
      return data.map(obj => {
        const { [dataElementCode]: measureValue, ...restData } = obj;
        return { [code]: measureValue, ...restData };
      });
    },
  );

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
      Object.values(measureDataResponsesByMeasureCode).map(({ period }) => period),
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
      .filter(e => e[measureOption.key] == value) // eslint-disable-line
      .map(e => e[measureOption.displayedValueKey]);
    return { name: getMostCommon(matchingElements) || name, value, ...rest };
  });
}

const getMeasureLevel = mapOverlays => {
  const aggregationTypes = mapOverlays.map(({ config }) => config.measureLevel);
  return uniq(aggregationTypes).join(',');
};

export default class extends DataAggregatingRouteHandler {
  static PermissionsChecker = MapOverlayPermissionsChecker;

  buildResponse = async () => {
    const { code } = this.entity;
    const { mapOverlayCode } = this.query;
    const measures = await this.models.mapOverlay.findMeasuresByCode(mapOverlayCode);

    // check permission
    await Promise.all(
      measures.map(async ({ permission_group: permissionGroup }) => {
        const isUserAllowedMeasure = await this.req.userHasAccess(code, permissionGroup);
        if (!isUserAllowedMeasure) {
          throw new CustomError(accessDeniedForMeasure);
        }
      }),
    ).catch(e => {
      // in the event of an access denied error, we need to catch this and handle it by throwing it further down the chain, so that the frontend can handle it and not show a blank screen
      throw new Error(e);
    });
    // start fetching actual data
    const shouldFetchSiblings = this.query.shouldShowAllParentCountryResults === 'true';
    const responseData = await Promise.all(
      measures.map(o => this.fetchMeasureData(o, shouldFetchSiblings)),
    );

    const { period, measureData } = buildMeasureData(measures, responseData);
    const measureOptions = await this.fetchMeasureOptions(measures, measureData, mapOverlayCode);

    return {
      mapOverlayCode,
      measureLevel: getMeasureLevel(measures),
      measureOptions,
      serieses: measureOptions,
      measureData,
      period,
    };
  };

  async fetchMeasureOptions(mapOverlays, measureData, mapOverlayCode) {
    const measureOptions = await Promise.all(mapOverlays.map(o => this.fetchMeasureOption(o)));
    measureOptions
      .filter(mo => mo.displayedValueKey)
      .filter(mo => !mo.disableRenameLegend)
      .map(mo => updateLegendFromDisplayedValueKey(mo, measureData));

    const getOtherMeasureOptionKeys = mainMapOverlayCode => {
      const otherLinkMeasureKeySet = new Set();
      measureData.forEach(data => {
        Object.keys(data).forEach(key => otherLinkMeasureKeySet.add(key));
      });
      otherLinkMeasureKeySet.delete('organisationUnitCode');
      otherLinkMeasureKeySet.delete(mainMapOverlayCode);

      return Array.from(otherLinkMeasureKeySet);
    };

    // Config 'measureConfig' only works for report-server
    const { measureConfig, ...mainMeasureOption } = measureOptions[0];
    if (measureConfig) {
      const { [ADD_TO_ALL_KEY]: configForAllKeys, ...restOfConfig } = measureConfig;
      getOtherMeasureOptionKeys(mapOverlayCode)
        .filter(key => !key.includes('_metadata'))
        .forEach(key => {
          measureOptions.push({ ...configForAllKeys, key, name: key, ...restOfConfig[key] });
        });
      measureOptions[0] = mainMeasureOption;
    }
    if (measureData.length === 0) {
      measureOptions[0].hideFromPopup = false;
    }
    return measureOptions;
  }

  async fetchMeasureOption(mapOverlay) {
    const {
      id, // -------------------------------- exclude these fields from the response --------------
      code, // ------------------------------------------------------------------------------------
      country_codes: countryCodes, // -------------------------------------------------------------
      project_codes: projectCodes, // -------------------------------------------------------------
      permission_group: permissionGroup, // -------------------------------------------------------
      data_services: dataServices, // -------------------------------------------------------------
      config,
      data_builder_config: measureBuilderConfig,
      name,
      legacy,
      ...restOfMapOverlay
    } = mapOverlay;
    const { dataElementCode = 'value' } = measureBuilderConfig ?? {};

    const {
      displayType,
      values,
      hideFromMenu,
      hideFromLegend,
      hideFromPopup,
      customLabel,
      ...restOfPresentationConfig
    } = config;

    const { periodGranularity } = measureBuilderConfig || {};
    const { startDate, endDate } = this.query;
    let dates = periodGranularity ? getDateRange(periodGranularity, startDate, endDate) : {};

    if (startDate && endDate && !periodGranularity) {
      dates = getDateRange('day', startDate, endDate);
    }

    const baseOptions = {
      ...restOfPresentationConfig,
      ...restOfMapOverlay,
      name: customLabel ?? name,
      type: displayType,
      key: code,
      periodGranularity,
      hideFromMenu: hideFromMenu || false,
      hideFromLegend: hideFromLegend || false,
      hideFromPopup: hideFromPopup || false,
      legacy,
      ...dates,
    };

    if (values) {
      return { ...baseOptions, values };
    }
    // values have not been provided locally - fetch them from DHIS2
    let options = {};
    if (legacy === true) {
      const { dataSourceType = DATA_SOURCE_TYPES.SINGLE } = measureBuilderConfig;
      if (dataSourceType === DATA_SOURCE_TYPES.SINGLE) {
        options = await this.getOptionsForDataElement(mapOverlay, dataElementCode);
      }
    }

    const translatedOptions = translateMeasureOptionSet(options, mapOverlay);

    return { ...baseOptions, values: translatedOptions };
  }

  async getOptionsForDataElement(mapOverlay, dataElementCode) {
    const [dataElement] = await this.aggregator.fetchDataElements([dataElementCode], {
      organisationUnitCode: this.entityCode,
      dataServices: mapOverlay.data_services,
      includeOptions: true,
    });

    if (!dataElement) {
      throw new Error(`Data element with code ${dataElementCode} not found`);
    }

    return dataElement.options;
  }

  async getDisplayOnLevelOrgUnitCode(mapOverlay) {
    const level = snake(mapOverlay.config?.displayOnLevel || 'country'); // Display at country level by default
    const hierarchyId = await this.fetchHierarchyId();
    const displayOnLevelEntity = await this.entity.getAncestorOfType(hierarchyId, level);

    if (!displayOnLevelEntity) {
      return null;
    }

    return displayOnLevelEntity.code;
  }

  async fetchMeasureData(mapOverlay, shouldFetchSiblings) {
    const { code, legacy, data_services: dataServices } = mapOverlay;

    const entityCode = shouldFetchSiblings
      ? await this.getDisplayOnLevelOrgUnitCode(mapOverlay)
      : this.entity.code;

    if (!entityCode) {
      // Exit early with no data if no ancestor org unit at displayOnLevel
      return { [code]: [] };
    }

    const entity = await this.models.entity.findOne({ code: entityCode });
    const dhisApi = getDhisApiInstance({
      entityCode: this.entity.code,
      isDataRegional: dataServices?.[0]?.isDataRegional,
    });

    if (legacy) {
      const { data_builder: measureBuilder, data_builder_config: measureBuilderConfig } =
        mapOverlay;
      assert.ok(
        measureBuilderConfig,
        `No data_builder_config for legacy overlay ${mapOverlay.code}`,
      );
      const { dataElementCode = 'value' } = measureBuilderConfig;
      dhisApi.injectFetchDataSourceEntities(this.fetchDataSourceEntities);
      const buildMeasure = async (measureCode, ...args) => ({
        [measureCode]: await getMeasureBuilder(measureBuilder)(...args),
      });

      return buildMeasure(
        code,
        this.models,
        this.aggregator,
        dhisApi,
        { ...this.query, dataElementCode },
        { ...measureBuilderConfig, dataServices },
        entity,
        this.req,
      );
    }

    // NON-LEGACY
    return {
      [code]: await reportServer({
        req: this.req,
        models: this.models,
        dataBuilderConfig: { reportCode: mapOverlay.report_code },
        query: { ...this.query },
        entity,
      }),
    };
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
