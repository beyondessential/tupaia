/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useLocation, useParams } from 'react-router-dom';
import { useDefaultDashboard } from '.';

export const useEntityLink = (entityCode?: string) => {
  const location = useLocation();
  const { projectCode, entityCode: entityCodeParam } = useParams();

  // If entityCode is not provided, use the one from the URL
  const newEntityCode = entityCode || entityCodeParam;

  const defaultDashboardName = useDefaultDashboard();

  return { ...location, pathname: `/${projectCode}/${newEntityCode}/${defaultDashboardName}` };
};
