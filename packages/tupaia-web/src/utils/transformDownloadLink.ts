import { API_URL } from '../api';

/**
 * This method is used to transform the download link. It first checks if the url is a full url, e.g. contains a baseUrl prefix. If it does, it returns the url as is. If it doesn't, it prepends the baseUrl to the url.
 */
export const transformDownloadLink = (resourceUrl: string) => {
  const baseUrl = API_URL;
  if (resourceUrl.includes('http')) return resourceUrl;
  if (baseUrl.endsWith('/')) return `${baseUrl}${resourceUrl}`; // remove trailing slash from baseUrl if it exists
  return `${baseUrl}/${resourceUrl}`;
};
