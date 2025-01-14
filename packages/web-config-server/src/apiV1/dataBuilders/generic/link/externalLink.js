/**
 * Returns a download link for a supplied url, with query parameters substitued in where replacement
 * placeholders are marked out
 */
export const externalLink = ({ dataBuilderConfig, query }) => {
  const { url } = dataBuilderConfig;
  // Substitute all custom replacements (marked by curly braces in the url) with
  // the equivalent value from the query parameters
  // E.g. https://info.tupaia.org/disaster-response/{organisationUnitCode} becomes
  // https://info.tupaia.org/disaster-response/VU
  const downloadUrl = Object.entries(query).reduce(
    (urlWithSubtitutions, [key, value]) =>
      urlWithSubtitutions.replace(new RegExp(`{${key}}`, 'g'), value),
    url,
  );
  return { data: [{ value: downloadUrl }] };
};
