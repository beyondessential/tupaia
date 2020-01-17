import { convertDateRangeToPeriods } from '@tupaia/dhis-api';
import { DashboardReport } from '/models';
import { getDhisApiInstance } from '@tupaia/data-broker';
import { CustomError } from '@tupaia/utils';
import { DhisTranslationHandler, isSingleValue } from './utils';
import { getDataBuilder } from '/apiV1/dataBuilders/getDataBuilder';

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

const convertDateRangeToPeriodQueryString = (startDate, endDate) => {
  if (!startDate) {
    return null;
  }

  if (startDate && !endDate) {
    return convertDateRangeToPeriods(startDate, startDate)[0];
  }

  return convertDateRangeToPeriods(startDate, endDate).join(';');
};

const getIsValidDate = dateString => !Number.isNaN(Date.parse(dateString));

/* View implementation now delegates data builder to corresponding view data builder
 */
export default class extends DhisTranslationHandler {
  buildData = async req => {
    const { startDate, endDate, ...restOfQuery } = req.query;
    if (getIsValidDate(startDate)) this.startDate = startDate;
    if (getIsValidDate(endDate)) this.endDate = endDate;

    const { viewId, drillDownLevel } = req.query;
    // If drillDownLevel is undefined, send it through as null instead so it's not dropped from the object.
    const dashboardReport = await DashboardReport.findOne({
      id: viewId,
      drillDownLevel: drillDownLevel || null,
    });
    if (!dashboardReport) {
      throw new CustomError(viewFail, noViewWithId, { viewId });
    }
    const { viewJson, dataBuilderConfig, dataServices } = dashboardReport;

    this.query = {
      ...restOfQuery,
      period: convertDateRangeToPeriodQueryString(this.startDate, this.endDate),
      startDate: this.startDate,
      endDate: this.endDate,
    };

    // process db response for row, create matching data builder and build the data
    let { dataBuilder } = dashboardReport;
    this.viewJson = viewJson;
    this.dataBuilderConfig = dataBuilderConfig;
    // if viewJson containes placeholder it can only be viewed in expanded view
    if (this.viewJson.placeholder && this.query.isExpanded !== 'true') {
      dataBuilder = 'blankDataBuilder';
    } else {
      // remove placeholder, prevent front end from rendering it
      this.viewJson.placeholder = undefined;
    }
    // Try to find matched data builder
    const dataBuilderForView = getDataBuilder(dataBuilder);
    if (!dataBuilderForView) {
      throw new CustomError(viewFail, noDataBuilder, { dataBuilder });
    }
    // Build the data and return it
    const dhisApiInstances = dataServices.map(({ isDataRegional }) =>
      getDhisApiInstance({ entityCode: this.entity.code, isDataRegional }),
    );
    const builtData = await dataBuilderForView({ ...this, req }, ...dhisApiInstances);
    return this.addViewMetaData(builtData);
  };

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
