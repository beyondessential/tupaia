import React from 'react';
import PropTypes from 'prop-types';
import { Divider, Typography } from '@material-ui/core';

import { A4Page, EntityDetails, DashboardTitleContainer } from '../components';
import { DashboardReport } from '../../DashboardReport';
import { yearToApiDates } from '../../../api/queries/utils';
import { useUrlSearchParam } from '../../../utils';
import { DEFAULT_DATA_YEAR } from '../../../constants';

export const DashboardReportPage = ({
  item,
  getNextPage,
  isEntityDetailsRequired,
  subDashboardName,
  exportOptions,
  useYearSelector,
  ...configs
}) => {
  const [selectedYear] = useUrlSearchParam('year', DEFAULT_DATA_YEAR);
  const { startDate, endDate } = useYearSelector ? yearToApiDates(selectedYear) : {};

  return (
    <A4Page
      key={item.code}
      page={getNextPage()}
      useYearSelector={useYearSelector}
      selectedYear={selectedYear}
      {...configs}
    >
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
  subDashboardName: PropTypes.string.isRequired,
  exportOptions: PropTypes.object.isRequired,
  useYearSelector: PropTypes.bool,
};

DashboardReportPage.defaultProps = {
  useYearSelector: false,
};
