/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import CircularProgress from 'material-ui/CircularProgress';

import { ExpandableList } from '../../../components/mobile/ExpandableList';
import { SelectListItem } from '../../../components/mobile/SelectListItem';
import { Dashboard } from '../../../components/mobile/Dashboard';
import {
  changeOrgUnit,
  toggleDashboardSelectExpand,
  changeDashboardGroup,
  requestOrgUnit,
} from '../../../actions';
import { WHITE } from '../../../styles';
import { selectCurrentDashboardKey } from '../../../selectors';

class HomeScreen extends PureComponent {
  componentWillMount(props) {
    const { hierarchyData, getNestedOrgUnits } = this.props;
    if (!hierarchyData || !Array.isArray(hierarchyData) || hierarchyData.length < 1) {
      getNestedOrgUnits('World');
    }

    window.scrollTo(0, 0);
  }

  render() {
    const {
      organisationUnits,
      isLoading,
      onChangeOrgUnit,
      currentOrganisationUnit,
      dashboardConfig,
      currentDashboardKey,
      onToggleDashboardSelectExpand,
      dashboardFilterIsExpanded,
      onChangeDashboardGroup,
    } = this.props;

    return (
      <div>
        <Dashboard
          orgUnit={currentOrganisationUnit}
          dashboardConfig={dashboardConfig}
          currentDashboardKey={currentDashboardKey}
          toggleFilter={onToggleDashboardSelectExpand}
          filterIsExpanded={dashboardFilterIsExpanded}
          handleFilterChange={name => onChangeDashboardGroup(name)}
        />
        <ExpandableList
          title={'Countries'}
          expandedByDefault={true}
          items={organisationUnits.map(({ organisationUnitCode, name }) => (
            <SelectListItem
              onSelect={onChangeOrgUnit}
              title={name}
              key={organisationUnitCode}
              data={organisationUnitCode}
            />
          ))}
          theme={{ background: WHITE, color: '#000' }}
        />
        {isLoading && (
          <div style={styles.spinner}>
            <CircularProgress />
          </div>
        )}
      </div>
    );
  }
}

const styles = {
  spinner: {
    textAlign: 'center',
    padding: 10,
    backgroundColor: WHITE,
  },
};

HomeScreen.propTypes = {
  getNestedOrgUnits: PropTypes.func.isRequired,
  onChangeOrgUnit: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  const { hierarchyData, isLoading } = state.searchBar;

  const { isGroupSelectExpanded } = state.dashboard;

  const { currentOrganisationUnit, dashboardConfig } = state.global;

  return {
    organisationUnits: hierarchyData || [],
    isLoading,
    currentOrganisationUnit,
    dashboardFilterIsExpanded: isGroupSelectExpanded,
    dashboardConfig,
    currentDashboardKey: selectCurrentDashboardKey(state),
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getNestedOrgUnits: organisationUnitCode => dispatch(requestOrgUnit(organisationUnitCode)),
    onChangeOrgUnit: organisationUnitCode => dispatch(changeOrgUnit(organisationUnitCode, false)),
    onToggleDashboardSelectExpand: () => dispatch(toggleDashboardSelectExpand()),
    onChangeDashboardGroup: name => dispatch(changeDashboardGroup(name)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);
