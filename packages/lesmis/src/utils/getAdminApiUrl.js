/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

export const getAdminApiUrl = () => {
  const { REACT_APP_ADMIN_API_URL } = process.env;
  if (REACT_APP_ADMIN_API_URL) {
    return REACT_APP_ADMIN_API_URL;
  }

  // if no env var, use sensible defaults based on the front end url
  const { hostname } = window.location; // eslint-disable-line no-undef

  // localhost becomes http://localhost:8060
  if (hostname === 'localhost') {
    return 'http://localhost:8070';
  }

  // lesmis.la becomes https://admin-api.lesmis.la
  const domainComponents = hostname.split('.');
  if (domainComponents.length === 2) {
    const [domain, tld] = domainComponents;
    return `https://admin-api.${domain}.${tld}`;
  }

  // www.lesmis.la becomes https://admin-api.lesmis.la
  const [subdomain, domain, tld] = domainComponents;
  if (subdomain === 'www') {
    return `https://admin-api.${domain}.${tld}`;
  }

  // lesmis.tupaia.org becomes https://admin-api.tupaia.org
  if (!subdomain.includes('-lesmis')) {
    return `https://admin-api.${domain}.${tld}`;
  }

  // dev-lesmis.tupaia.org becomes https://dev-admin-api.tupaia.org
  const [branch] = subdomain.split('-lesmis');
  return `https://${branch}-admin-api.${domain}.${tld}`;
};
