import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { ReportConnection } from '/connections';

export class ReportServerBuilder extends DataBuilder {
  /**
   * @param {Request} req
   * @param {ModelRegistry} models
   * @param {?Object} config
   * @param {Object} query
   * @param {Entity} [entity]
   */
  constructor(req, models, config, query, entity) {
    super(models, undefined, undefined, config, query, entity);
    this.reportConnection = new ReportConnection(req);
  }

  async build() {
    const hierarchyName = (
      await this.models.entityHierarchy.findById(await this.fetchEntityHierarchyId())
    ).name;

    const requestQuery = {
      organisationUnitCodes: this.entity.code,
      hierarchy: hierarchyName,
    };

    if (this.query.startDate) {
      requestQuery.startDate = this.query.startDate;
    }

    if (this.query.endDate) {
      requestQuery.endDate = this.query.endDate;
    }

    const { results } = await this.reportConnection.fetchReport(
      this.config.reportCode,
      requestQuery,
    );

    return Array.isArray(results) ? { data: results } : { ...results };
  }
}

export const reportServer = async ({ req, models, dataBuilderConfig, query, entity }) => {
  const builder = new ReportServerBuilder(req, models, dataBuilderConfig, query, entity);
  return builder.build();
};
