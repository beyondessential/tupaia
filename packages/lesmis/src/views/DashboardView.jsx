/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useIsFetching } from '@tanstack/react-query';
import { Select } from '@tupaia/ui-components';
import MuiBox from '@material-ui/core/Box';
import { VitalsView } from './VitalsView';
import { TabPanel, TabBarSection, YearSelector, TabBar } from '../components';
import {
  useUrlParams,
  useUrlSearchParams,
  useUrlSearchParam,
  getExportableSubDashboards,
  useDashboardDropdownOptions,
} from '../utils';
import { useEntityData } from '../api/queries';
import {
  DEFAULT_DATA_YEAR,
  DASHBOARD_REPORT_TAB_VIEW,
  FAVOURITE_DASHBOARD_TAB_VIEW,
  TAB_TEMPLATE,
} from '../constants';
import { DashboardReportModal } from '../components/DashboardReportModal';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { DashboardExportModal } from '../components/DashboardExportModal';
import { DashboardReportTabView } from './DashboardReportTabView';
import { FavouriteDashboardTabView } from './FavouriteDashboardTabView';

const StyledSelect = styled(Select)`
  margin: 0 1rem 0 0;
  width: 14rem;
  text-transform: capitalize;
`;

const TabTemplate = ({ TabBarLeftSection, body }) => {
  return (
    <>
      <TabBar>
        <TabBarLeftSection />
      </TabBar>
      <MuiBox p={5} minHeight={600}>
        {body}
      </MuiBox>
    </>
  );
};

TabTemplate.propTypes = {
  TabBarLeftSection: PropTypes.func.isRequired,
  body: PropTypes.string.isRequired,
};

const getTabComponent = tabViewType => {
  switch (tabViewType) {
    case DASHBOARD_REPORT_TAB_VIEW:
      return DashboardReportTabView;
    case FAVOURITE_DASHBOARD_TAB_VIEW:
      return FavouriteDashboardTabView;
    case TAB_TEMPLATE:
    default:
      return TabTemplate;
  }
};

export const DashboardView = React.memo(({ isOpen, setIsOpen }) => {
  const isFetching = useIsFetching(['dashboardReport']);
  const { entityCode } = useUrlParams();
  const { data: entityData } = useEntityData(entityCode);
  // eslint-disable-next-line no-unused-vars
  const [params, setParams] = useUrlSearchParams();
  const [selectedYear, setSelectedYear] = useUrlSearchParam('year', DEFAULT_DATA_YEAR);

  const { dropdownOptions, selectedOption } = useDashboardDropdownOptions();
  const { totalPage } = getExportableSubDashboards(selectedOption);

  const handleDashboardChange = event => {
    setParams({ dashboard: event.target.value, subDashboard: null });
  };

  return (
    <ErrorBoundary>
      <VitalsView entityCode={entityCode} entityType={entityData?.type} />
      {dropdownOptions.map(({ value, tabViewType, useYearSelector, componentProps }) => {
        const TabComponent = getTabComponent(tabViewType);

        return (
          <TabPanel key={value} isSelected={value === selectedOption.value} Panel={React.Fragment}>
            <TabComponent
              {...componentProps}
              entityCode={entityCode}
              useYearSelector={useYearSelector}
              TabBarLeftSection={() => (
                <TabBarSection>
                  <StyledSelect
                    id="dashboardtab"
                    options={dropdownOptions}
                    value={selectedOption.value}
                    onChange={handleDashboardChange}
                    showPlaceholder={false}
                    SelectProps={{
                      MenuProps: { disablePortal: true },
                    }}
                  />
                  {useYearSelector && (
                    <YearSelector
                      value={selectedYear}
                      onChange={setSelectedYear}
                      isLoading={!!isFetching}
                    />
                  )}
                </TabBarSection>
              )}
            />
          </TabPanel>
        );
      })}
      <DashboardReportModal />
      <DashboardExportModal
        title={entityData?.name ? entityData?.name : ''}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        totalPage={totalPage}
      />
    </ErrorBoundary>
  );
});

DashboardView.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
};
