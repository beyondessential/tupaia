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
import BackButton from '../../../components/mobile/BackButton';
import { Dashboard } from '../../../components/mobile/Dashboard';
import StaticMap from '../../../components/StaticMap';
import { toggleDashboardSelectExpand, setDashboardGroup } from '../../../actions';
import { DARK_BLUE } from '../../../styles';
import { getMapUrl } from '../../../utils';
import { selectCurrentDashboardName, selectCurrentOrgUnit } from '../../../selectors';

const MAP_WIDTH = 420;
const MAP_HEIGHT = 250;

const styles = {
  mapWrapper: {
    maxHeight: 400,
    overflow: 'hidden',
  },
  mapLink: {
    display: 'block',
    position: 'relative',
    paddingBottom: `${Math.floor((MAP_HEIGHT / MAP_WIDTH) * 100)}%`,
    background: DARK_BLUE,
    zIndex: 2, // Above floating toolbar.
    overflow: 'hidden',
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
};

function scrollToTop() {
  window.scrollTo(0, 0);
}

class RegionScreen extends PureComponent {
  componentDidMount() {
    scrollToTop();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.orgUnit.organisationUnitCode !== this.props.orgUnit.organisationUnitCode) {
      scrollToTop();
    }
  }

  onToggleDashboard() {
    const open = this.state.dashboardOpen;
    this.setState({
      dashboardOpen: !open,
    });
  }

  renderMap() {
    const { orgUnit } = this.props;
    if (!orgUnit || !orgUnit.location || !orgUnit.location.bounds) {
      return '';
    }

    const url = getMapUrl(orgUnit);

    return (
      <div style={styles.mapWrapper}>
        <a style={styles.mapLink} href={url} target="_blank" rel="noreferrer noopener">
          <StaticMap
            polygonBounds={orgUnit.location.bounds}
            alt={`Map of ${orgUnit.name}`}
            width={MAP_WIDTH}
            height={MAP_HEIGHT}
            style={styles.map}
            showAttribution={false}
          />
        </a>
      </div>
    );
  }

  renderLoading() {
    const { isLoading } = this.props;

    if (!isLoading) {
      return null;
    }

    return (
      <div style={styles.spinner}>
        <CircularProgress />
      </div>
    );
  }

  render() {
    const {
      dashboards,
      onToggleDashboardSelectExpand,
      orgUnit,
      dashboardFilterIsExpanded,
      currentDashboardName,
      onChangeDashboardGroup,
    } = this.props;

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
  }
}

RegionScreen.propTypes = {
  dashboards: PropTypes.array.isRequired,
  orgUnit: PropTypes.object.isRequired,
  isLoading: PropTypes.bool,
  onToggleDashboardSelectExpand: PropTypes.func.isRequired,
  dashboardFilterIsExpanded: PropTypes.bool,
  currentDashboardName: PropTypes.string,
  onChangeDashboardGroup: PropTypes.func.isRequired,
};

RegionScreen.defaultProps = {
  isLoading: false,
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
