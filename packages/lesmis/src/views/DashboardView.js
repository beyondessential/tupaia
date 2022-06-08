/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MuiBox from '@material-ui/core/Box';
import { useIsFetching } from 'react-query';
import { Select } from '@tupaia/ui-components';
import { VitalsView } from './VitalsView';
import { TabPanel, TabBar, TabBarSection, YearSelector } from '../components';
import { useUrlParams, useUrlSearchParams, useUrlSearchParam } from '../utils';
import { useEntityData } from '../api/queries';
import { DEFAULT_DATA_YEAR } from '../constants';
import { DashboardReportModal } from '../components/DashboardReportModal';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useDashboardDropdownOptions } from '../utils/useDashboardDropdownOptions';

const StyledSelect = styled(Select)`
  margin: 0 1rem 0 0;
  width: 14rem;
  text-transform: capitalize;
`;

export const DashboardView = React.memo(() => {
  const isFetching = useIsFetching('dashboardReport');
  const { entityCode } = useUrlParams();
  const { data: entityData } = useEntityData(entityCode);
  // eslint-disable-next-line no-unused-vars
  const [params, setParams] = useUrlSearchParams();
  const [selectedYear, setSelectedYear] = useUrlSearchParam('year', DEFAULT_DATA_YEAR);

  const { dropdownOptions, selectedOption } = useDashboardDropdownOptions();

  const handleDashboardChange = event => {
    setParams({ dashboard: event.target.value, subDashboard: null });
  };

  return (
    <ErrorBoundary>
      <VitalsView entityCode={entityCode} entityType={entityData?.type} />
      {dropdownOptions.map(({ value, TabComponent, useYearSelector, componentProps }) => (
        <TabPanel key={value} isSelected={value === selectedOption.value} Panel={React.Fragment}>
          <TabComponent
            {...componentProps}
            entityCode={entityCode}
            year={useYearSelector && selectedYear}
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
      ))}
      <DashboardReportModal />
    </ErrorBoundary>
  );
});
