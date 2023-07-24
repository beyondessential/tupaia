/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
export const transformDownloadLink = (resourceUrl: string) => {
  const baseUrl = import.meta.env.REACT_APP_TUPAIA_WEB_API_URL || 'http://localhost:8080/api/v1/';
  if (resourceUrl.includes('http')) return resourceUrl;
  return `${baseUrl}${resourceUrl}`;
};
