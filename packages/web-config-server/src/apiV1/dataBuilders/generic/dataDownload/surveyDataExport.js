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

    if (exportDataBuilderName === 'reportServer') {
      return this.buildReportData();
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
    const { surveys } = this.config;
    const { startDate, endDate, surveyCodes } = this.query;
    const selectedSurveyCodes = surveyCodes.split(',');

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

    const surveyData = {};

    await Promise.all(
      surveys.map(async survey => {
        const { reportCode, name: surveyName, codes, code } = survey;
        if (
          codes.some(c => !selectedSurveyCodes.includes(c)) &&
          !selectedSurveyCodes.includes(code)
        ) {
          return;
        }
        const { results } = await reportConnection.fetchReport(reportCode, requestQuery);
        surveyData[surveyName] = {
          data: results,
        };
      }),
    );

    return { data: surveyData };
  };
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
