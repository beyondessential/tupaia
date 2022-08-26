/**
 * dev.tupaia.org -> dev.cdn.tupaia.org
 * @param {string} host
 * @returns
 */

export const convertToCDNHost = host => {
  const domainIndex = host.indexOf('.tupaia.org');
  return `${host.slice(0, domainIndex)}.cdn${host.slice(domainIndex)}`;
};
