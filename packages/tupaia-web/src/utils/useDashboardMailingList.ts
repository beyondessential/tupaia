/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useParams } from 'react-router';
import { useDashboards } from '../api/queries';

export const useDashboardMailingList = () => {
  const { projectCode, entityCode, dashboardName } = useParams();
  const { activeDashboard } = useDashboards(projectCode, entityCode, dashboardName);
  if (!activeDashboard) {
    return undefined;
  }

  const { mailingLists } = activeDashboard;
  if (!mailingLists) {
    return undefined;
  }

  const mailingList = mailingLists.find(
    ({ entityCode: mailingListEntityCode }) => mailingListEntityCode === entityCode,
  );

  return mailingList;
};
