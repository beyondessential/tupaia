import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

import { buildExportUrl } from '/export';

import { getDataBuilder } from '/apiV1/dataBuilders/getDataBuilder';

class RawDataExportBuilder extends DataBuilder {
  async build() {
    const surveyCodes = this.query.surveyCodes;
    if (!surveyCodes) {
      return this.getSurveyExportOptions();
    }

    return this.fetchExportResults();
  }

  getSurveyExportOptions() {
    const { surveys } = this.config;

    return {
      data: surveys.map(({ name, code }) => ({
        name,
        value: code,
      })),
      downloadUrl: buildExportUrl(this.req, 'rawDataSurveyResponses', {
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

    const buildData = getDataBuilder(exportDataBuilderName);

    return buildData(
      {
        query: this.query,
        entity: this.entity,
        dataBuilderConfig: { ...exportDataBuilderConfig, surveys, dataServices },
      },
      this.aggregator,
      this.dhisApi,
    );
  };

  injectReq(req) {
    this.req = req;
  }
}

export const rawDataExport = async (
  { dataBuilderConfig, query, entity, req },
  aggregator,
  dhisApi,
) => {
  const builder = new RawDataExportBuilder(
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    aggregator.aggregationTypes.RAW_DATA,
  );

  builder.injectReq(req);

  return builder.build();
};
