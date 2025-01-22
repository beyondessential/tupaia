export const getApiUrl = () => {
  const { REACT_APP_LESMIS_API_URL } = import.meta.env;
  if (REACT_APP_LESMIS_API_URL) {
    return REACT_APP_LESMIS_API_URL;
  }

  // if no env var, use sensible defaults based on the front end url
  const { hostname } = window.location; // eslint-disable-line no-undef
  const version = 'v1';

  // localhost becomes http://localhost:8060
  if (hostname === 'localhost') {
    return `http://localhost:8060/${version}`;
  }

  // lesmis.la becomes https://api.lesmis.la
  const domainComponents = hostname.split('.');
  if (domainComponents.length === 2) {
    const [domain, tld] = domainComponents;
    return `https://api.${domain}.${tld}/${version}`;
  }

  // www.lesmis.la becomes https://api.lesmis.la
  const [subdomain, domain, tld] = domainComponents;
  if (subdomain === 'www') {
    return `https://api.${domain}.${tld}/${version}`;
  }

  // lesmis.tupaia.org becomes https://lesmis-api.tupaia.org, and dev-lesmis.tupaia.org becomes
  // https://dev-lesmis-api.tupaia.org
  return `https://${subdomain}-api.${domain}.${tld}/${version}`;
};
