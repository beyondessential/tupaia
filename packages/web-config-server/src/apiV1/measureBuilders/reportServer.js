import { ReportServerBuilder } from '/apiV1//dataBuilders/generic/reportServer/reportServerDataBuilder';

export const reportServer = async (
  models,
  aggregator,
  dhisApi,
  query,
  measureBuilderConfig = {},
  entity,
) => {
  const { req, ...restOfQuery } = query;
  const builder = new ReportServerBuilder(req, models, measureBuilderConfig, restOfQuery, entity);
  return builder.build();
};
