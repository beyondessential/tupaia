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
import { changeOrgUnit, toggleDashboardSelectExpand, changeDashboardGroup } from '../../../actions';
import { WHITE } from '../../../styles';
import { selectCurrentDashboardKey, selectOrgUnitChildren } from '../../../selectors';

class HomeScreen extends PureComponent {
  componentWillMount() {
    window.scrollTo(0, 0);
  }

  render() {
    const {
      organisationUnits,
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
          title="Countries"
          expandedByDefault={true}
          items={sortOrgUnitsAlphabeticallyByName(organisationUnits).map(
            ({ organisationUnitCode, name }) => (
              <SelectListItem
                onSelect={onChangeOrgUnit}
                title={name}
                key={organisationUnitCode}
                data={organisationUnitCode}
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
  //Sort countries alphabetically, this may not be the case if one country was loaded first
  return orgUnits.concat().sort((data1, data2) => {
    if (data1.name > data2.name) return 1;
    if (data1.name < data2.name) return -1;
    return 0;
  });
};

HomeScreen.propTypes = {
  onChangeOrgUnit: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  const { isGroupSelectExpanded } = state.dashboard;

  const { currentOrganisationUnit, dashboardConfig } = state.global;
  const organisationUnits = selectOrgUnitChildren(state, 'World') || [];

  return {
    organisationUnits,
    currentOrganisationUnit,
    dashboardFilterIsExpanded: isGroupSelectExpanded,
    dashboardConfig,
    currentDashboardKey: selectCurrentDashboardKey(state),
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onChangeOrgUnit: organisationUnitCode => dispatch(changeOrgUnit(organisationUnitCode, false)),
    onToggleDashboardSelectExpand: () => dispatch(toggleDashboardSelectExpand()),
    onChangeDashboardGroup: name => dispatch(changeDashboardGroup(name)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);
