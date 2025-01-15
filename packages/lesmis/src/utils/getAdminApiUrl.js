export const getAdminApiUrl = () => {
  const { REACT_APP_ADMIN_API_URL } = import.meta.env;
  if (REACT_APP_ADMIN_API_URL) {
    return REACT_APP_ADMIN_API_URL;
  }

  // if no env var, use sensible defaults based on the front end url
  const { hostname } = window.location; // eslint-disable-line no-undef

  const version = 'v1';

  // localhost becomes http://localhost:8070
  if (hostname === 'localhost') {
    return `http://localhost:8070/${version}`;
  }

  // lesmis.la becomes https://admin-api.lesmis.la
  const domainComponents = hostname.split('.');
  if (domainComponents.length === 2) {
    const [domain, tld] = domainComponents;
    return `https://admin-api.${domain}.${tld}/${version}`;
  }

  // www.lesmis.la becomes https://admin-api.lesmis.la
  const [subdomain, domain, tld] = domainComponents;
  if (subdomain === 'www') {
    return `https://admin-api.${domain}.${tld}/${version}`;
  }

  // lesmis.tupaia.org becomes https://admin-api.tupaia.org
  if (!subdomain.includes('-lesmis')) {
    return `https://admin-api.${domain}.${tld}/${version}`;
  }

  // dev-lesmis.tupaia.org becomes https://dev-admin-api.tupaia.org
  const [branch] = subdomain.split('-lesmis');
  return `https://${branch}-admin-api.${domain}.${tld}/${version}`;
};
