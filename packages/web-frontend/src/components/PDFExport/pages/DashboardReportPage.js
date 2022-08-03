import React from 'react';
import PropTypes from 'prop-types';
import { Divider, Typography } from '@material-ui/core';

import { DashboardTitleContainer } from '../components/DashboardTitleContainer';
import { DashboardReport } from '../../DashboardReport';

export const DashboardReportPage = ({
  item,
  isEntityDetailsRequired,
  subDashboardName,
  exportOptions,
  useYearSelector,
  PageContainer,
  ...configs
}) => {
  return (
    <PageContainer key={item.code} useYearSelector={useYearSelector} {...configs}>
      <DashboardTitleContainer>
        <Typography variant="h2">{subDashboardName}</Typography>
        <Divider />
        <Typography variant="h5">{item.name}</Typography>
      </DashboardTitleContainer>
      <DashboardReport
        reportCode={item.reportCode}
        name={item.name}
        exportOptions={exportOptions}
        isExporting // render exporting format
        isEnlarged // render exporting format
      />
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
  useYearSelector: PropTypes.bool,
};

DashboardReportPage.defaultProps = {
  useYearSelector: false,
  getNextPage: () => {},
};
