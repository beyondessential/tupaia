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
        if (surveys.includes(codes.tostring() && surveys.includes(code))) {
          return;
        }
        const { results } = await reportConnection.fetchReport(reportCode, requestQuery);

        // Add data element names to columns
        // TODO: Do it in report server
        const dataElementsMetadata = (
          await Promise.all(
            surveyCodes.split(',').map(async surveyCode => {
              const { dataElements } = await this.fetchDataGroup(surveyCode);
              return dataElements.map(dataElement => ({
                key: dataElement.code,
                title: dataElement.text,
              }));
            }),
          )
        ).flat();

        const keysFromMetadata = dataElementsMetadata.map(({ key }) => key);
        // Entity code, Entity Name, Date or other added columns
        const restOfColumns = results.columns.filter(
          column => !keysFromMetadata.includes(column.key),
        );

        surveyData[surveyName] = {
          data: {
            ...results,
            columns: [...restOfColumns, ...dataElementsMetadata],
          },
        };
      }),
    );

    return { data: surveyData };
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
