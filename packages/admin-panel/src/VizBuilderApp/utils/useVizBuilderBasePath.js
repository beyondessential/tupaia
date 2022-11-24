/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { useLocation } from 'react-router-dom';

export const useVizBuilderBasePath = () => {
  const { pathname } = useLocation();
  return pathname.substring(0, pathname.indexOf('/viz-builder/')) || '';
};
