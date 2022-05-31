import React from 'react';
import PropTypes from 'prop-types';
import { Divider, Typography } from '@material-ui/core';

import { A4Page, EntityDetails } from '../components';
import { DashboardReport } from '../../DashboardReport';
import { DashboardTitleContainer } from './styles';

export const DashboardReportPage = ({
  item,
  startDate,
  endDate,
  getNextPage,
  isEntityDetailsRequired,
  subDashboardName,
  exportOptions,
  ...configs
}) => {
  return (
    <A4Page key={item.code} page={getNextPage()} {...{ ...configs }}>
      {isEntityDetailsRequired && <EntityDetails />}
      <DashboardTitleContainer>
        <Typography variant="h2">{subDashboardName}</Typography>
        <Divider />
        <Typography variant="h5">{item.name}</Typography>
      </DashboardTitleContainer>
      <DashboardReport
        reportCode={item.reportCode}
        name={item.name}
        startDate={startDate}
        endDate={endDate}
        exportOptions={exportOptions}
        isExporting
        isEnlarged
      />
    </A4Page>
  );
};

DashboardReportPage.propTypes = {
  item: PropTypes.shape({
    code: PropTypes.string,
    name: PropTypes.string,
    reportCode: PropTypes.string,
  }).isRequired,
  addToRefs: PropTypes.func.isRequired,
  getNextPage: PropTypes.func.isRequired,
  isEntityDetailsRequired: PropTypes.bool.isRequired,
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  subDashboardName: PropTypes.string.isRequired,
  exportOptions: PropTypes.object.isRequired,
};

DashboardReportPage.defaultProps = {
  startDate: undefined,
  endDate: undefined,
};
