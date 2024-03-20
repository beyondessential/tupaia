import { CustomError, replaceValues, convertDateRangeToPeriodQueryString } from '@tupaia/utils';
import { DataAggregatingRouteHandler } from './DataAggregatingRouteHandler';
import { ReportPermissionsChecker } from './permissions';
import { ReportConnection } from '/connections';
import { getDataBuilder } from '/apiV1/dataBuilders/getDataBuilder';
import { getDhisApiInstance } from '/dhis';

const reportFail = {
  type: 'Report Error',
  responseStatus: 400,
};

const noReportWithCode = {
  responseText: {
    status: 'reportError',
    details: 'No report with corresponding code',
  },
};

const noDataBuilder = {
  responseText: {
    status: 'reportError',
    details: 'No data builder defined for current report',
  },
};

const getIsValidDate = dateString => !Number.isNaN(Date.parse(dateString));

export class ReportHandler extends DataAggregatingRouteHandler {
  static PermissionsChecker = ReportPermissionsChecker;

  buildResponse = async () => {
    const { startDate, endDate } = this.query;
    if (getIsValidDate(startDate)) this.startDate = startDate;
    if (getIsValidDate(endDate)) this.endDate = endDate;

    const { reportCode } = this.params;
    const { legacy } = this.query;

    const reportData =
      legacy === 'true'
        ? await this.buildLegacyReportData(reportCode)
        : await this.buildReportData(reportCode);

    return {
      ...reportData,
      startDate: this.startDate,
      endDate: this.endDate,
    };
  };

  async buildReportData(reportCode) {
    const reportConnection = new ReportConnection(this.req);
    const hierarchyId = await this.fetchHierarchyId();
    const hierarchyName = (await this.models.entityHierarchy.findById(hierarchyId)).name;

    const requestQuery = {
      organisationUnitCodes: [this.entity.code],
      hierarchy: hierarchyName,
    };

    if (this.startDate) {
      requestQuery.startDate = this.startDate;
    }

    if (this.endDate) {
      requestQuery.endDate = this.endDate;
    }

    const { results } = await reportConnection.fetchReport(reportCode, requestQuery);
    return Array.isArray(results) ? { data: results } : { ...results };
  }

  async buildLegacyReportData(reportCode) {
    const report = await this.models.legacyReport.findOne({
      code: reportCode,
    });

    if (!report) {
      throw new CustomError(reportFail, noReportWithCode, { reportCode });
    }

    const { startDate, endDate, ...restOfQuery } = this.query;

    this.query = {
      ...restOfQuery,
      period: convertDateRangeToPeriodQueryString(this.startDate, this.endDate),
      startDate,
      endDate,
    };

    const {
      data_builder_config: dataBuilderConfig,
      data_builder: dataBuilder,
      data_services: dataServices,
    } = report;

    this.dataBuilderConfig = this.translateDataBuilderConfig(dataBuilderConfig, dataServices);
    const reportData = await this.buildDataBuilderData(dataBuilder);

    return {
      ...reportData,
    };
  }

  async buildDataBuilderData(dataBuilderName) {
    const dataBuilder = getDataBuilder(dataBuilderName);
    if (!dataBuilder) {
      throw new CustomError(reportFail, noDataBuilder, { dataBuilder });
    }

    const dhisApiInstances = this.dataBuilderConfig.dataServices.map(({ isDataRegional }) => {
      const dhisApi = getDhisApiInstance({ entityCode: this.entity.code, isDataRegional });
      dhisApi.injectFetchDataSourceEntities(this.fetchDataSourceEntities);
      return dhisApi;
    });

    return dataBuilder(this, this.aggregator, ...dhisApiInstances);
  }

  translateDataBuilderConfig(dataBuilderConfig, dataServices) {
    const replacedConfig = replaceValues(dataBuilderConfig, this.query);
    return { ...replacedConfig, dataServices };
  }
}
