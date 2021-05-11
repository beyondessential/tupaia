/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { ReportConnection } from '/connections';

class ReportServerBuilder extends DataBuilder {
  /**
   * @param {Request} req
   * @param {Aggregator} aggregator
   * @param {DhisApi} dhisApi
   * @param {?Object} config
   * @param {Object} query
   * @param {Entity} [entity]
   */
  constructor(req, models, aggregator, dhisApi, config, query, entity) {
    super(models, aggregator, dhisApi, config, query, entity);
    this.reportConnection = new ReportConnection(req);
  }

  async build() {
    const hierarchyName = (
      await this.models.entityHierarchy.findById(await this.fetchEntityHierarchyId())
    ).name;
    const response = await this.reportConnection.fetchReport(this.config.reportCode, {
      startDate: this.query.startDate,
      endDate: this.query.endDate,
      organisationUnitCodes: this.entity.code,
      hierarchy: hierarchyName,
    });

    return { data: response.results };
  }
}

export const reportServer = async (
  { req, models, dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const builder = new ReportServerBuilder(
    req,
    models,
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
  );
  return builder.build();
};
