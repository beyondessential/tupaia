import { buildExportUrl } from '/export';

export const latestDownloadLink = async ({ req, query, dataBuilderConfig }) => {
  const { surveyCodes, name } = dataBuilderConfig;
  const downloadLinkJson = {
    viewType: 'singleDownloadLink',
    name: name || 'Download full survey response',
    value: buildExportUrl('surveyResponses', {
      ...query,
      surveyCodes: surveyCodes.join(','),
      latest: true,
    }),
  };
  return { data: [downloadLinkJson] };
};
