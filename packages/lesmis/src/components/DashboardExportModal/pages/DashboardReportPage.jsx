import React from 'react';
import PropTypes from 'prop-types';
import { Divider, Typography } from '@material-ui/core';

import { EntityDetails, DashboardTitleContainer } from '../components';
import { DashboardReport } from '../../DashboardReport';
import { useIsFavouriteDashboardSelected, useUrlSearchParam } from '../../../utils';
import { DEFAULT_DATA_YEAR } from '../../../constants';
import Header from '../components/Header';

export const DashboardReportPage = ({
  item,
  isEntityDetailsRequired,
  subDashboardName,
  exportOptions,
  useYearSelector,
  PageContainer,
  dashboardLabel,
  PageContent,
  ...configs
}) => {
  // TODO: will be removed when implementing year selector for favourite dashboard, currently use default year.
  const isFavouriteDashboardSelected = useIsFavouriteDashboardSelected();
  const [selectedYear] = isFavouriteDashboardSelected
    ? [DEFAULT_DATA_YEAR]
    : useUrlSearchParam('year', DEFAULT_DATA_YEAR);

  return (
    <PageContainer {...configs}>
      <Header
        useYearSelector={useYearSelector}
        selectedYear={selectedYear}
        dashboardLabel={dashboardLabel}
      />
      <PageContent>
        {isEntityDetailsRequired && <EntityDetails />}
        <DashboardTitleContainer>
          <Typography variant="h2">{subDashboardName}</Typography>
          <Divider />
          <Typography variant="h5">{item.name}</Typography>
        </DashboardTitleContainer>
        <DashboardReport
          itemCode={item.code}
          reportCode={item.reportCode}
          name={item.name}
          exportOptions={exportOptions}
          isExporting // render exporting format
          isEnlarged // render exporting format
          useYearSelector={useYearSelector}
        />
      </PageContent>
    </PageContainer>
  );
};

DashboardReportPage.propTypes = {
  item: PropTypes.shape({
    code: PropTypes.string,
    name: PropTypes.string,
    reportCode: PropTypes.string,
  }).isRequired,
  getNextPage: PropTypes.func,
  isEntityDetailsRequired: PropTypes.bool.isRequired,
  subDashboardName: PropTypes.string.isRequired,
  exportOptions: PropTypes.object.isRequired,
  PageContainer: PropTypes.func.isRequired,
  PageContent: PropTypes.object.isRequired,
  dashboardLabel: PropTypes.string.isRequired,
  useYearSelector: PropTypes.bool,
};

DashboardReportPage.defaultProps = {
  useYearSelector: false,
  getNextPage: () => {},
};
