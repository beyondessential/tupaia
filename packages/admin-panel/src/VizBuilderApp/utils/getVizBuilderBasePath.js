/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

export const getVizBuilderBasePath = pathname => {
  return pathname.substring(0, pathname.indexOf('/viz-builder/')) || '';
};
