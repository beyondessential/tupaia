/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

export const transformDownloadLink = (resourceUrl: string) => {
  const baseUrl = process.env.REACT_APP_CONFIG_SERVER_BASE_URL || 'http://localhost:8080/api/v1/';
  if (resourceUrl.includes('http')) return resourceUrl;
  return `${baseUrl}${resourceUrl}`;
};
