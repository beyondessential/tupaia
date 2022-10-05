/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { Report } from '../types';

// Used when combining the report and dashboardItem/mapOverlay
export const extractDataFromReport = (report: Report) => {
  const { config } = report;
  if ('customReport' in config) {
    return { customReport: config.customReport };
  }

  const { transform } = config;
  return { transform };
};
