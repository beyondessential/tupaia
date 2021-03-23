import { CustomError, replaceValues } from '@tupaia/utils';
import { DataAggregatingRouteHandler } from './DataAggregatingRouteHandler';
import { DashboardPermissionsChecker } from './permissions';
import { isSingleValue } from './utils';
import { getDataBuilder } from '/apiV1/dataBuilders/getDataBuilder';
import { getDhisApiInstance } from '/dhis';
import { convertDateRangeToPeriodQueryString } from '/utils';

const viewFail = {
  type: 'View Error',
  responseStatus: 400,
};

const noViewWithId = {
  responseText: {
    status: 'viewError',
    details: 'No view with corresponding id',
  },
};

const noDataBuilder = {
  responseText: {
    status: 'viewError',
    details: 'No data builder defined for current view',
  },
};

const getIsValidDate = dateString => !Number.isNaN(Date.parse(dateString));

/* View implementation now delegates data builder to corresponding view data builder
 */
export default class extends DataAggregatingRouteHandler {
  static PermissionsChecker = DashboardPermissionsChecker;

  buildResponse = async () => {
    const { startDate, endDate, ...restOfQuery } = this.query;
    if (getIsValidDate(startDate)) this.startDate = startDate;
    if (getIsValidDate(endDate)) this.endDate = endDate;

    const { viewId, drillDownLevel } = this.query;
    // If drillDownLevel is undefined, send it through as null instead so it's not dropped from the object.
    const dashboardReport = await this.models.dashboardReport.findOne({
      id: viewId,
      drillDownLevel: drillDownLevel || null,
    });
    if (!dashboardReport) {
      throw new CustomError(viewFail, noViewWithId, { viewId });
    }

    this.query = {
      ...restOfQuery,
      period: convertDateRangeToPeriodQueryString(this.startDate, this.endDate),
      startDate: this.startDate,
      endDate: this.endDate,
    };

    const { viewJson, dataBuilderConfig, dataBuilder, dataServices } = dashboardReport;
    this.viewJson = this.translateViewJson(viewJson);

    this.dataBuilderConfig = this.translateDataBuilderConfig(dataBuilderConfig, dataServices);

    const dataBuilderData = await this.buildDataBuilderData(dataBuilder);
    return this.addViewMetaData(dataBuilderData);
  };

  async buildDataBuilderData(dataBuilderName) {
    const dataBuilder = this.getDataBuilder(dataBuilderName);
    if (!dataBuilder) {
      throw new CustomError(viewFail, noDataBuilder, { dataBuilder });
    }

    const dhisApiInstances = this.dataBuilderConfig.dataServices.map(({ isDataRegional }) => {
      const dhisApi = getDhisApiInstance({ entityCode: this.entity.code, isDataRegional });
      dhisApi.injectFetchDataSourceEntities(this.fetchDataSourceEntities);
      return dhisApi;
    });

    return dataBuilder(this, this.aggregator, ...dhisApiInstances);
  }

  translateViewJson(viewJson) {
    // if a dashboard is expanded, we remove any placeholder it may normally display
    return this.query.isExpanded === 'true' ? { ...viewJson, placeholder: undefined } : viewJson;
  }

  translateDataBuilderConfig(dataBuilderConfig, dataServices) {
    const replacedConfig = replaceValues(dataBuilderConfig, this.query);
    return { ...replacedConfig, dataServices };
  }

  getDataBuilder(dataBuilderName) {
    // if there is a placeholder to display, don't build any data
    return getDataBuilder(this.viewJson.placeholder ? 'blankDataBuilder' : dataBuilderName);
  }

  // common view translation (for all possible views)
  addViewMetaData = inJson => {
    const { viewJson, query, startDate, endDate } = this;
    const { drillDown } = viewJson;
    let returnJson = {
      viewId: query.viewId,
      drillDownLevel: drillDown && !query.drillDownLevel ? 0 : query.drillDownLevel,
      organisationUnitCode: query.organisationUnitCode,
      dashboardGroupId: query.dashboardGroupId,
      startDate,
      endDate,
      ...viewJson,
    };
    // Some of the data builders are used for single and multi data values, multi data values
    // get stored as a row in data field, where as single data values info should be joined to
    // straight to the root json. Some single values are a set of value,
    // i.e. for fraction it's 'value' and 'total' thus ...inJson.data[0].
    if (
      isSingleValue(viewJson) &&
      typeof inJson.data === 'object' &&
      typeof inJson.data[0] === 'object'
    ) {
      returnJson = { ...inJson.data[0], data: undefined, ...returnJson };
    }

    return { ...inJson, ...returnJson };
  };
}
