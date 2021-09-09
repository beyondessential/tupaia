import { ReportServerBuilder } from '/apiV1/dataBuilders/generic/reportServer/reportServerDataBuilder';

export const useReportServer = async (
  models,
  aggregator,
  dhisApi,
  query,
  measureBuilderConfig = {},
  entity,
  req,
) => {
  const builder = new ReportServerBuilder(req, models, measureBuilderConfig, query, entity);
  return builder.build();
};
