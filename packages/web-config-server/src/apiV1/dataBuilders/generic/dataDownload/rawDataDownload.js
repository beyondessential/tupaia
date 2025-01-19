import { buildExportUrl } from '/export';

export const rawDataDownload = ({ dataBuilderConfig, query, req }) => {
  const { surveys } = dataBuilderConfig;
  return {
    data: surveys.map(({ name, code }) => ({
      name,
      value: code,
    })),
    downloadUrl: buildExportUrl('surveyResponses', { ...query, easyReadingMode: true }),
  };
};
