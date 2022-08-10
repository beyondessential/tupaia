/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
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
import MuiIconButton from '@material-ui/core/Button';
import DownloadIcon from '@material-ui/icons/GetApp';
import styled from 'styled-components';
import { FlexSpaceBetween } from '@tupaia/ui-components';

import StaticMap from '../components/StaticMap';
import { DASHBOARD_STYLES, DASHBOARD_META_MARGIN } from '../styles';
import { setDashboardGroup, closeDropdownOverlays } from '../actions';
import { DashboardGroup } from './DashboardGroup';
import { getOrgUnitPhotoUrl } from '../utils';
import { DropDownMenu } from '../components/DropDownMenu';
import {
  selectCurrentDashboardName,
  selectCurrentOrgUnit,
  selectCurrentOrgUnitBounds,
  selectCurrentProject,
} from '../selectors';
import { DEFAULT_BOUNDS } from '../defaults';
import DashboardExportModal from './DashboardExportModal';

const IMAGE_HEIGHT_RATIO = 0.5;

const MuiButton = styled(MuiIconButton)`
  font-size: 10px;
  margin: 5px 10px 0px 10px;
  background-color: transparent;
  color: white;
`;

export class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.onScroll = this.onScroll.bind(this);
    this.state = {
      showFloatingHeader: false,
      isPhotoEnlarged: false,
      isOpen: true,
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
        src={getOrgUnitPhotoUrl(currentOrganisationUnit)}
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
          src={getOrgUnitPhotoUrl(currentOrganisationUnit)}
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
    const { onChangeDashboardGroup, currentDashboardName, dashboardNames } = this.props;

    if (dashboardNames.length === 0) {
      return null;
    }

    const currentDashboardIndex = dashboardNames.findIndex(name => name === currentDashboardName);

    return (
      <DropDownMenu
        selectedOptionIndex={currentDashboardIndex}
        options={dashboardNames}
        onChange={onChangeDashboardGroup}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        menuListStyle={DASHBOARD_STYLES.groupsDropDownMenu}
      />
    );
  }

  renderHeader() {
    const { currentOrganisationUnit } = this.props;

    return (
      <div style={DASHBOARD_STYLES.meta}>
        {this.renderMetaMedia()}
        <FlexSpaceBetween>
          <h2 style={DASHBOARD_STYLES.title}>{currentOrganisationUnit.name}</h2>
          <MuiButton
            startIcon={<DownloadIcon style={{ fontSize: 16 }} />}
            variant="outlined"
            onClick={() => this.setState({ isOpen: true })}
            disableElevation
          >
            export
          </MuiButton>
        </FlexSpaceBetween>
      </div>
    );
  }

  render() {
    const {
      onDashboardClicked,
      isLoading,
      currentGroupDashboard,
      currentOrganisationUnit,
      currentProjectName,
    } = this.props;
    const exportFileName =
      currentGroupDashboard &&
      `${currentProjectName}-${currentOrganisationUnit.name}-${currentGroupDashboard.dashboardName}-dashboard-export`;

    return (
      <>
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
        <DashboardExportModal
          exportFileName={exportFileName}
          isOpen={this.state.isOpen}
          setIsOpen={bool => this.setState({ isOpen: bool })}
          currentGroupDashboard={currentGroupDashboard}
        />
      </>
    );
  }
}

Dashboard.propTypes = {
  onChangeDashboardGroup: PropTypes.func.isRequired,
  currentDashboardName: PropTypes.string,
  currentProjectName: PropTypes.string,
  currentOrganisationUnit: PropTypes.object,
  currentGroupDashboard: PropTypes.object,
  currentOrganisationUnitBounds: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
  dashboardNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  onDashboardClicked: PropTypes.func.isRequired,
  mapIsAnimating: PropTypes.bool,
  isSidePanelExpanded: PropTypes.bool.isRequired,
  contractedWidth: PropTypes.number,
  isLoading: PropTypes.bool,
};

Dashboard.defaultProps = {
  currentDashboardName: '',
  currentProjectName: undefined,
  currentOrganisationUnit: {},
  currentGroupDashboard: null,
  currentOrganisationUnitBounds: [],
  mapIsAnimating: false,
  contractedWidth: 0,
  isLoading: false,
};

const mapStateToProps = state => {
  const { isAnimating } = state.map;
  const { isLoadingOrganisationUnit, dashboards, isSidePanelExpanded, project } = state.global;
  const { contractedWidth } = state.dashboard;
  const currentOrganisationUnit = selectCurrentOrgUnit(state);
  const currentOrganisationUnitBounds = selectCurrentOrgUnitBounds(state);
  const currentDashboardName = selectCurrentDashboardName(state);
  const currentProject = selectCurrentProject(state);

  const dashboardNames = [];
  // sort group names based on current project
  dashboards.forEach(({ dashboardName, project: dashboardProject }) => {
    if (dashboardProject && dashboardProject === project) {
      dashboardNames.unshift(dashboardName);
    } else {
      dashboardNames.push(dashboardName);
    }
  });

  if (currentOrganisationUnit.type === 'Project') {
    currentOrganisationUnit.name =
      currentProject?.config?.projectDashboardHeader || currentOrganisationUnit.name;
  }

  const currentGroupDashboard = dashboards.find(d => d.dashboardName === currentDashboardName);

  return {
    currentOrganisationUnit,
    currentOrganisationUnitBounds,
    currentProjectName: currentProject.name,
    dashboardNames,
    currentGroupDashboard,
    currentDashboardName,
    mapIsAnimating: isAnimating,
    isLoading: isLoadingOrganisationUnit,
    isSidePanelExpanded,
    contractedWidth,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onSetDashboardGroup: name => dispatch(setDashboardGroup(name)),
    onDashboardClicked: () => dispatch(closeDropdownOverlays()),
  };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { dashboardNames } = stateProps;
  const { onSetDashboardGroup, ...restOfDispatchProps } = dispatchProps;
  return {
    ...stateProps,
    ...restOfDispatchProps,
    ...ownProps,
    onChangeDashboardGroup: index => onSetDashboardGroup(dashboardNames[index]),
  };
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Dashboard);
