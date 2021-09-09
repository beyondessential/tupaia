/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { ExpandableList } from '../../../components/mobile/ExpandableList';
import { SelectListItem } from '../../../components/mobile/SelectListItem';
import { Dashboard } from '../../../components/mobile/Dashboard';
import { setOrgUnit, toggleDashboardSelectExpand, setDashboardGroup } from '../../../actions';
import { WHITE } from '../../../styles';
import {
  selectCurrentDashboardName,
  selectOrgUnitChildren,
  selectCurrentOrgUnit,
  selectCurrentProjectCode,
} from '../../../selectors';

class HomeScreen extends PureComponent {
  componentWillMount() {
    window.scrollTo(0, 0);
  }

  render() {
    const {
      organisationUnits,
      onChangeOrgUnit,
      currentOrganisationUnit,
      dashboards,
      currentDashboardName,
      onToggleDashboardSelectExpand,
      dashboardFilterIsExpanded,
      onChangeDashboardGroup,
    } = this.props;

    return (
      <div>
        <Dashboard
          orgUnit={currentOrganisationUnit}
          dashboards={dashboards}
          currentDashboardName={currentDashboardName}
          toggleFilter={onToggleDashboardSelectExpand}
          filterIsExpanded={dashboardFilterIsExpanded}
          handleFilterChange={name => onChangeDashboardGroup(name)}
        />
        <ExpandableList
          title="Countries"
          expandedByDefault
          items={sortOrgUnitsAlphabeticallyByName(organisationUnits).map(
            ({ organisationUnitCode, name }) => (
              <SelectListItem
                onSelect={onChangeOrgUnit}
                title={name}
                key={organisationUnitCode}
                orgUnitCode={organisationUnitCode}
              />
            ),
          )}
          theme={{ background: WHITE, color: '#000' }}
        />
      </div>
    );
  }
}

const sortOrgUnitsAlphabeticallyByName = orgUnits => {
  // Sort countries alphabetically, this may not be the case if one country was loaded first
  return orgUnits.concat().sort((data1, data2) => {
    if (data1.name > data2.name) return 1;
    if (data1.name < data2.name) return -1;
    return 0;
  });
};

HomeScreen.propTypes = {
  onChangeOrgUnit: PropTypes.func.isRequired,
  organisationUnits: PropTypes.array,
  currentOrganisationUnit: PropTypes.object,
  dashboards: PropTypes.array,
  currentDashboardName: PropTypes.string,
  dashboardFilterIsExpanded: PropTypes.bool,
  onToggleDashboardSelectExpand: PropTypes.func.isRequired,
  onChangeDashboardGroup: PropTypes.func.isRequired,
};

HomeScreen.defaultProps = {
  organisationUnits: [],
  currentOrganisationUnit: {},
  dashboards: [],
  currentDashboardName: '',
  dashboardFilterIsExpanded: false,
};

const mapStateToProps = state => {
  const { isGroupSelectExpanded } = state.dashboard;

  const { dashboards } = state.global;
  const organisationUnits = selectOrgUnitChildren(state, selectCurrentProjectCode(state));

  return {
    organisationUnits,
    currentOrganisationUnit: selectCurrentOrgUnit(state),
    dashboardFilterIsExpanded: isGroupSelectExpanded,
    dashboards,
    currentDashboardName: selectCurrentDashboardName(state),
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onChangeOrgUnit: organisationUnitCode => dispatch(setOrgUnit(organisationUnitCode, false)),
    onToggleDashboardSelectExpand: () => dispatch(toggleDashboardSelectExpand()),
    onChangeDashboardGroup: name => dispatch(setDashboardGroup(name)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);
