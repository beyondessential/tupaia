import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

import { buildExportUrl } from '/export';

import { getDataBuilder } from '/apiV1/dataBuilders/getDataBuilder';
import { ReportConnection } from '/connections';

class SurveyDataExportBuilder extends DataBuilder {
  constructor(req, ...superClassArgs) {
    super(...superClassArgs);
    this.req = req;
  }

  async build() {
    const { surveyCodes } = this.query;
    if (!surveyCodes) {
      // First call to this data builder will return only the available surveys that can be exported.
      return this.getSurveyExportOptions();
    }

    // When surveyCodes is provided in the query, it will grab the exportDataBuilder
    // and build the actual data that can be exported.
    return this.fetchExportResults();
  }

  getSurveyExportOptions() {
    const { surveys } = this.config;

    return {
      data: surveys.map(({ name, code, codes }) => ({
        name,
        value: codes || code,
      })),
      downloadUrl: buildExportUrl('surveyDataDownload', {
        ...this.query,
      }),
    };
  }

  fetchExportResults = async () => {
    const { exportDataBuilder, dataServices, surveys } = this.config;

    if (!exportDataBuilder) {
      throw new Error('Data builder for exporting not provided');
    }

    const {
      dataBuilder: exportDataBuilderName,
      dataBuilderConfig: exportDataBuilderConfig,
    } = this.config.exportDataBuilder;

    if (exportDataBuilderName === 'report') {
      const result = await this.buildReportData();
      return { data: { [surveys[0].name]: { data: result } } };
    }
    const buildData = getDataBuilder(exportDataBuilderName);

    return buildData(
      {
        models: this.models,
        query: this.query,
        entity: this.entity,
        dataBuilderConfig: { ...exportDataBuilderConfig, surveys, dataServices },
      },
      this.aggregator,
      this.dhisApi,
    );
  };

  fetchAndCacheProject = async () => {
    return this.models.project.findOne({
      code: this.query.projectCode || 'explore',
    });
  };

  fetchHierarchyId = async () => (await this.fetchAndCacheProject()).entity_hierarchy_id;

  buildReportData = async () => {
    const { itemCode: reportCode, startDate, endDate, surveyCodes } = this.query;

    const reportConnection = new ReportConnection(this.req);
    const hierarchyId = await this.fetchHierarchyId();
    const hierarchyName = (await this.models.entityHierarchy.findById(hierarchyId)).name;

    const requestQuery = {
      organisationUnitCodes: [this.entity.code],
      hierarchy: hierarchyName,
    };

    if (startDate) {
      requestQuery.startDate = startDate;
    }

    if (endDate) {
      requestQuery.endDate = endDate;
    }

    const { results } = await reportConnection.fetchReport(reportCode, requestQuery);
    return Array.isArray(results) ? { data: results } : { ...results };
  };

  async fetchDataGroup(code) {
    const { dataServices } = this.config;
    const { organisationUnitCode } = this.query;

    return this.aggregator.fetchDataGroup(code, {
      organisationUnitCode,
      dataServices,
      includeOptions: true,
    });
  }
}

export const surveyDataExport = async (
  { models, dataBuilderConfig, query, entity, req },
  aggregator,
  dhisApi,
) => {
  const builder = new SurveyDataExportBuilder(
    req,
    models,
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    aggregator.aggregationTypes.RAW_DATA,
  );

  return builder.build();
};
