/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { DashboardItemsPage } from '@tupaia/admin-panel/lib';

// Remove import and export buttons from Dashboard Items page because they are handled by
// admin-panel-server and not central-server
export const DashboardItemsView = props => {
  const dashboardItemColumns = DashboardItemsPage(props).props.columns;
  const columns = dashboardItemColumns.filter(
    column => column.type !== 'export' && column.type !== 'export',
  );
  return (
    <DashboardItemsPage columns={columns} importConfig={null} LinksComponent={null} {...props} />
  );
};
