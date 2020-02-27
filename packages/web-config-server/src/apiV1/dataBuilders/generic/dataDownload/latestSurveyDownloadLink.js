import { latestDataValueDate } from '/apiV1/dataBuilders/generic/latestData';
import { composeBuiltData } from '/apiV1/utils';
import { latestDownloadLink } from './latestDownloadLink';

export const latestSurveyDownloadLink = async (
  { dataBuilderConfig, query, req, viewJson },
  aggregator,
  dhisApi,
) => {
  const dateJson = await latestDataValueDate(
    { dataBuilderConfig, query, viewJson },
    aggregator,
    dhisApi,
  );

  if (dateJson.data[0].value) {
    const downloadLinkBuiltData = await latestDownloadLink({ dataBuilderConfig, query, req });
    return composeBuiltData(dateJson, downloadLinkBuiltData);
  }

  return dateJson;
};
