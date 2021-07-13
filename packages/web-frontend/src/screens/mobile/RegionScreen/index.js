/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import BackButton from '../../../components/mobile/BackButton';
import { Dashboard } from '../../../components/mobile/Dashboard';
import { toggleDashboardSelectExpand, setDashboardGroup } from '../../../actions';
import { selectCurrentDashboardName, selectCurrentOrgUnit } from '../../../selectors';

const RegionScreen = ({
  dashboards,
  onToggleDashboardSelectExpand,
  orgUnit,
  dashboardFilterIsExpanded,
  currentDashboardName,
  onChangeDashboardGroup,
}) => {
  const { organisationUnitCode } = orgUnit;

  useEffect(() => {
    window.scrollTo(0, 0); // scroll to top
  }, [organisationUnitCode]);

  return (
    <div>
      <Dashboard
        orgUnit={orgUnit}
        dashboards={dashboards}
        currentDashboardName={currentDashboardName}
        toggleFilter={onToggleDashboardSelectExpand}
        filterIsExpanded={dashboardFilterIsExpanded}
        handleFilterChange={onChangeDashboardGroup}
      />
      <BackButton orgUnit={orgUnit} />
    </div>
  );
};

RegionScreen.propTypes = {
  dashboards: PropTypes.array.isRequired,
  orgUnit: PropTypes.object.isRequired,
  onToggleDashboardSelectExpand: PropTypes.func.isRequired,
  dashboardFilterIsExpanded: PropTypes.bool,
  currentDashboardName: PropTypes.string,
  onChangeDashboardGroup: PropTypes.func.isRequired,
};

RegionScreen.defaultProps = {
  dashboardFilterIsExpanded: false,
  currentDashboardName: '',
};

const mapStateToProps = state => {
  const { dashboards, isLoadingOrganisationUnit } = state.global;
  const { isGroupSelectExpanded } = state.dashboard;
  const orgUnit = selectCurrentOrgUnit(state);

  return {
    dashboards,
    currentDashboardName: selectCurrentDashboardName(state),
    orgUnit,
    dashboardFilterIsExpanded: isGroupSelectExpanded,
    isLoading: isLoadingOrganisationUnit,
  };
};

const mapDispatchToProps = dispatch => ({
  onToggleDashboardSelectExpand: () => dispatch(toggleDashboardSelectExpand()),
  onChangeDashboardGroup: name => dispatch(setDashboardGroup(name)),
});

export default connect(mapStateToProps, mapDispatchToProps)(RegionScreen);
