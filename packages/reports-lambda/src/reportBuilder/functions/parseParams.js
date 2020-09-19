export const parseParams = (row, params) => {
  if (typeof params === 'string') {
    if (!params.match(/^<.*>$/i)) {
      return params;
    }

    const strippedToken = params.substring(1, params.length - 1); //Remove '<', '>' tags
    return row[strippedToken];
  }

  if (Array.isArray(params)) {
    return params.map(param => parseParams(row, param));
  }

  if (typeof params === 'object' && params !== null) {
    const parsedParams = {};
    Object.entries(params).forEach(([key, value]) => {
      parsedParams[key] = parseParams(row, value);
    });
    return parsedParams;
  }

  return params;
};
