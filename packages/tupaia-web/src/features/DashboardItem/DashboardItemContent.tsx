/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useContext } from 'react';
import { NoData } from '@tupaia/ui-components';
import { BaseReport } from '@tupaia/types';
import { FetchErrorAlert } from '../../components';
import { DashboardItemReport, DashboardItemConfig } from '../../types';
import {
  View,
  Chart,
  Matrix,
  ProjectDescription,
  NoAccessDashboard,
  NoDataAtLevelDashboard,
} from '../Visuals';
import { ExpandItemButton } from './ExpandItemButton';
import { DashboardItemContext } from './DashboardItemContext';
import { DashboardItemLoader } from './DashboardItemLoader';
import { DashboardItemDateDisplay } from './DashboardItemDateDisplay';

const DisplayComponents = {
  chart: Chart,
  view: View,
  matrix: Matrix,
  ProjectDescription,
  NoAccessDashboard,
  NoDataAtLevelDashboard,
};

const getHasNoData = (report: DashboardItemReport, type: DashboardItemConfig['type']) => {
  // If there is no report, if means it is loading or there is an error, which is handled elsewhere
  if (!report) return false;
  if (type === 'view' || type === 'chart') {
    return (report as BaseReport)?.data?.length === 0;
  }
  return false;
};
/**
 * DashboardItemContent handles displaying of the content within a dashboard item, e.g. charts. It also handles error messages and loading states
 */
export const DashboardItemContent = () => {
  const { config, report, isExport, isLoading, error, refetch } = useContext(DashboardItemContext);

  const { type, componentName } = config || {};

  const componentKey = componentName || type;

  const DisplayComponent = DisplayComponents[componentKey as keyof typeof DisplayComponents];

  if (!DisplayComponent) return null;

  if (error) return <FetchErrorAlert error={error} refetch={isExport ? undefined : refetch} />;
  // there will be no report returned if type is component, so don't show the loader for that type
  if (isLoading || (!report && config?.type !== 'component'))
    return <DashboardItemLoader name={config?.name} isExport={isExport} />;

  // if there is no data for the selected dates, then we want to show a message to the user
  const showNoDataMessage = isLoading ? false : getHasNoData(report!, type);

  return (
    <>
      {showNoDataMessage ? (
        <NoData
          viewContent={{
            ...config,
            ...report,
          }}
        />
      ) : (
        <DisplayComponent />
      )}
      {/** We still want to have the expand button if there is no data because in some cases the user can expand and change the dates */}
      <DashboardItemDateDisplay />
      <ExpandItemButton />
    </>
  );
};
