/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * Dashboard
 *
 * Visual flex arranged div that arranges the Dashboard. Should include control containers
 * and DashboardGroup Container.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import shallowEqual from 'shallowequal';
import Dialog from '@material-ui/core/Dialog';
import StaticMap from '../../components/StaticMap';

import { DASHBOARD_STYLES, DASHBOARD_META_MARGIN } from '../../styles';
import { setDashboardGroup, closeDropdownOverlays } from '../../actions';
import DashboardGroup from '../DashboardGroup';
import { getFacilityThumbnailUrl } from '../../utils';
import { DropDownMenu } from '../../components/DropDownMenu';
import {
  selectCurrentDashboardName,
  selectCurrentOrgUnit,
  selectCurrentOrgUnitBounds,
} from '../../selectors';
import { DEFAULT_BOUNDS } from '../../defaults';

const IMAGE_HEIGHT_RATIO = 0.5;

export class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.onScroll = this.onScroll.bind(this);
    this.state = {
      showFloatingHeader: false,
      isPhotoEnlarged: false,
    };

    this.collapsibleGroupRefs = {};
  }

  shouldComponentUpdate(nextProps, nextState) {
    // Update the dashboard data after map zoom completed.
    if (nextProps.mapIsAnimating) {
      return false;
    }

    const hasPropsChanged = !shallowEqual(this.props, nextProps);
    const hasStateChanged = !shallowEqual(this.state, nextState);
    return hasPropsChanged || hasStateChanged;
  }

  onScroll(e) {
    const { scrollTop } = e.target;

    // Perfect point at which the floating header overlaps with the static header and should appear and start to scroll.
    const floatingHeaderScroll = 6;

    if (scrollTop < floatingHeaderScroll && this.state.showFloatingHeader) {
      this.setState({ showFloatingHeader: false });
    } else if (scrollTop >= floatingHeaderScroll && !this.state.showFloatingHeader) {
      this.setState({ showFloatingHeader: true });
    }
  }

  renderMiniMap(visible) {
    if (!visible) return null;
    const { contractedWidth } = this.props;

    const { currentOrganisationUnitBounds } = this.props;
    if (!currentOrganisationUnitBounds) {
      return null;
    }
    // If the organisation is the redux default, the location contains a point coordinate,
    // instead of bounds, or the current org unit is the world render the default world map.

    const mapWidth = contractedWidth - DASHBOARD_META_MARGIN * 2;
    return (
      <StaticMap
        polygonBounds={currentOrganisationUnitBounds}
        width={mapWidth * 2 /* Multiply by 2 to render maps that look sharp when expanded */}
        height={
          mapWidth *
          IMAGE_HEIGHT_RATIO *
          2 /* Multiply by 2 to render maps that look sharp when expanded */
        }
        style={DASHBOARD_STYLES.metaImage}
        showBox={currentOrganisationUnitBounds !== DEFAULT_BOUNDS}
      />
    );
  }

  renderPhoto(visible) {
    const { currentOrganisationUnit } = this.props;
    return (
      <img
        src={getFacilityThumbnailUrl(currentOrganisationUnit)}
        alt={currentOrganisationUnit.name}
        style={{ ...DASHBOARD_STYLES.metaImage, display: visible ? 'block' : 'none' }}
        onClick={() => this.setState({ isPhotoEnlarged: true })}
      />
    );
  }

  renderEnlargePopup() {
    const { isPhotoEnlarged } = this.state;
    const { currentOrganisationUnit } = this.props;

    if (!isPhotoEnlarged) {
      return null;
    }

    return (
      <Dialog
        open
        onClose={() => this.setState({ isPhotoEnlarged: false })}
        style={DASHBOARD_STYLES.metaImageDialog}
      >
        <img
          src={getFacilityThumbnailUrl(currentOrganisationUnit)}
          style={DASHBOARD_STYLES.metaImageDialogImage}
          alt={currentOrganisationUnit.name}
        />
      </Dialog>
    );
  }

  renderMetaMedia() {
    const { currentOrganisationUnit, contractedWidth } = this.props;

    // Important: Overhead of inserting a leaflet map into the DOM is high, therefore
    // css display properties are used to show and hide the map when needed and the
    // map is only inserted once.
    const showMap = !currentOrganisationUnit.photoUrl;
    const mediaWidth = contractedWidth - DASHBOARD_META_MARGIN * 2;

    return (
      <div style={{ ...DASHBOARD_STYLES.metaImageHolder, height: mediaWidth * IMAGE_HEIGHT_RATIO }}>
        {this.renderMiniMap(showMap)}
        {this.renderPhoto(!showMap)}
      </div>
    );
  }

  renderGroup(groupData) {
    const { isSidePanelExpanded } = this.props;

    return <DashboardGroup tab={groupData} isSidePanelExpanded={isSidePanelExpanded} />;
  }

  renderFloatingHeader() {
    const { currentOrganisationUnit, contractedWidth, isSidePanelExpanded } = this.props;
    const { showFloatingHeader } = this.state;

    return (
      <div
        ref={element => {
          this.floatingHeader = element;
        }}
        style={{
          ...DASHBOARD_STYLES.floatingHeader,
          width: contractedWidth,
          visibility: showFloatingHeader && !isSidePanelExpanded ? 'visible' : 'hidden',
        }}
      >
        <h2 style={DASHBOARD_STYLES.title}>{currentOrganisationUnit.name}</h2>
      </div>
    );
  }

  renderGroupsDropdown() {
    const { onChangeDashboardGroup, currentDashboardName, dashboards, project } = this.props;
    const dashboardNames = [];

    // sort group names based on current project
    dashboards.forEach(({ dashboardName, project: dashboardProject }) => {
      if (dashboardProject === project) dashboardNames.unshift(dashboardName);
      else dashboardNames.push(dashboardName);
    }, []);

    if (dashboardNames.length === 0) {
      return null;
    }

    return (
      <DropDownMenu
        selectedOption={currentDashboardName}
        options={dashboardNames}
        onChange={onChangeDashboardGroup}
        menuListStyle={DASHBOARD_STYLES.groupsDropDownMenu}
      />
    );
  }

  renderHeader() {
    const { currentOrganisationUnit } = this.props;

    return (
      <div style={DASHBOARD_STYLES.meta}>
        {this.renderMetaMedia()}
        <h2 style={DASHBOARD_STYLES.title}>{currentOrganisationUnit.name}</h2>
      </div>
    );
  }

  render() {
    const { onDashboardClicked, isLoading, dashboards, currentDashboardName } = this.props;
    const currentGroupDashboard = dashboards.find(d => d.dashboardName === currentDashboardName);

    return (
      <div
        style={{ ...DASHBOARD_STYLES.container, ...(isLoading ? DASHBOARD_STYLES.loading : {}) }}
        onClick={onDashboardClicked}
        onScroll={this.onScroll}
        ref={element => {
          this.contentScroller = element;
        }}
      >
        {this.renderHeader()}
        <div style={DASHBOARD_STYLES.content}>
          {this.renderGroupsDropdown()}
          {this.renderGroup(currentGroupDashboard)}
        </div>
        {this.renderFloatingHeader()}
        {this.renderEnlargePopup()}
      </div>
    );
  }
}

Dashboard.propTypes = {
  onChangeDashboardGroup: PropTypes.func.isRequired,
  currentDashboardName: PropTypes.string,
  currentOrganisationUnit: PropTypes.object,
  currentOrganisationUnitBounds: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
  onDashboardClicked: PropTypes.func.isRequired,
  mapIsAnimating: PropTypes.bool,
  isSidePanelExpanded: PropTypes.bool.isRequired,
  contractedWidth: PropTypes.number,
  dashboards: PropTypes.array,
  project: PropTypes.string,
  isLoading: PropTypes.bool,
};

Dashboard.defaultProps = {
  currentDashboardName: '',
  currentOrganisationUnit: {},
  currentOrganisationUnitBounds: [],
  mapIsAnimating: false,
  contractedWidth: 0,
  dashboards: [],
  project: '',
  isLoading: false,
};

const mapStateToProps = state => {
  const { isAnimating } = state.map;
  const { isLoadingOrganisationUnit, dashboards, isSidePanelExpanded, project } = state.global;
  const { contractedWidth } = state.dashboard;
  const currentOrganisationUnit = selectCurrentOrgUnit(state);
  const currentOrganisationUnitBounds = selectCurrentOrgUnitBounds(state);
  const currentDashboardName = selectCurrentDashboardName(state);

  return {
    currentOrganisationUnit,
    currentOrganisationUnitBounds,
    dashboards,
    currentDashboardName,
    mapIsAnimating: isAnimating,
    isLoading: isLoadingOrganisationUnit,
    isSidePanelExpanded,
    contractedWidth,
    project,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onChangeDashboardGroup: name => dispatch(setDashboardGroup(name)),
    onDashboardClicked: () => dispatch(closeDropdownOverlays()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
