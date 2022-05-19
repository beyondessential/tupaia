/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import CircularProgress from 'material-ui/CircularProgress';

import { getOrgUnitPhotoUrl } from '../../utils';
import { toggleDashboardSelectExpand, setDashboardGroup } from '../../actions';
import { selectCurrentDashboardName, selectCurrentOrgUnit } from '../../selectors';
import { DashboardGroup } from '../DashboardGroup';
import FilterSelect from '../../components/mobile/FilterSelect';
import { DARK_BLUE, WHITE, MOBILE_MARGIN_SIZE } from '../../styles';

const OuterContainer = styled.div`
  padding: 0;
  background: ${DARK_BLUE};
  color: ${WHITE};
  overflow: hidden;
`;

const List = styled.div`
  grid-column: 1 / 3;
`;

const Container = styled.div`
  padding: 20px ${MOBILE_MARGIN_SIZE}px 0;
  display: grid;
  grid-template-columns: auto auto;
  grid-template-rows: auto auto;
  overflow: hidden;
  justify-content: space-between;
  background: ${DARK_BLUE};
  color: ${WHITE};
`;

const OrgUnitImageWrapper = styled.div`
  min-height: 280px;
`;

const OrgUnitImage = styled.img`
  width: 100%;
`;

const SpinnerContainer = styled.div`
  background: rgba(0, 0, 0, 0.5);
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
`;

export const DashboardComponent = ({
  dashboards,
  orgUnit,
  currentDashboardName,
  onToggleDashboardSelectExpand,
  dashboardFilterIsExpanded,
  onChangeDashboardGroup,
  isLoading,
}) => {
  const { name } = orgUnit;
  const photoUrl = getOrgUnitPhotoUrl(orgUnit);

  const filterItems = dashboards.map(({ dashboardName }) => ({
    label: dashboardName,
    id: dashboardName,
    value: dashboardName,
  }));

  const currentFilter = filterItems.find(item => item.id === currentDashboardName) || {
    label: 'General',
    id: 'General',
  };

  return (
    <div>
      {photoUrl && (
        <OrgUnitImageWrapper>
          <OrgUnitImage src={photoUrl} alt={name} />
        </OrgUnitImageWrapper>
      )}
      <OuterContainer>
        <Container>
          <List>
            {filterItems && filterItems.length > 1 ? (
              <FilterSelect
                filters={filterItems}
                filterIsExpanded={dashboardFilterIsExpanded}
                currentFilter={currentFilter}
                onFilterOpen={onToggleDashboardSelectExpand}
                onFilterClose={onToggleDashboardSelectExpand}
                onFilterChange={onChangeDashboardGroup}
                theme={{ background: DARK_BLUE, color: WHITE }}
                showLoadingIcon={false}
              />
            ) : (
              <div>{currentFilter ? currentFilter.label : ''}</div>
            )}
            <DashboardGroup
              key={currentFilter.label}
              tab={dashboards.find(d => d.dashboardName === currentFilter.label)}
            />
          </List>
        </Container>
      </OuterContainer>
      {isLoading && (
        <SpinnerContainer>
          <CircularProgress />
        </SpinnerContainer>
      )}
    </div>
  );
};

DashboardComponent.propTypes = {
  dashboards: PropTypes.array.isRequired,
  orgUnit: PropTypes.object.isRequired,
  isLoading: PropTypes.bool,
  dashboardFilterIsExpanded: PropTypes.bool,
  currentDashboardName: PropTypes.string,
  onToggleDashboardSelectExpand: PropTypes.func.isRequired,
  onChangeDashboardGroup: PropTypes.func.isRequired,
};

DashboardComponent.defaultProps = {
  isLoading: false,
  currentDashboardName: '',
  dashboardFilterIsExpanded: PropTypes.func,
};

const mapStateToProps = state => {
  const { dashboards, isLoadingOrganisationUnit } = state.global;
  const { isGroupSelectExpanded } = state.dashboard;

  return {
    dashboards,
    orgUnit: selectCurrentOrgUnit(state),
    isLoading: isLoadingOrganisationUnit,
    dashboardFilterIsExpanded: isGroupSelectExpanded,
    currentDashboardName: selectCurrentDashboardName(state),
  };
};

const mapDispatchToProps = dispatch => ({
  onToggleDashboardSelectExpand: () => dispatch(toggleDashboardSelectExpand()),
  onChangeDashboardGroup: name => dispatch(setDashboardGroup(name)),
});

export const Dashboard = connect(mapStateToProps, mapDispatchToProps)(DashboardComponent);
