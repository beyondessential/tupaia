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
import MapOpenIcon from 'material-ui/svg-icons/action/open-in-new';
import FacilityPlaceholderIcon from 'material-ui/svg-icons/device/wallpaper';

import { Dashboard } from '../../../components/mobile/Dashboard';
import BackButton from '../../../components/mobile/BackButton';
import { DARK_BLUE, MOBILE_MARGIN_SIZE, WHITE } from '../../../styles';
import { getFacilityThumbnailUrl, getMapUrl } from '../../../utils';
import { toggleDashboardSelectExpand, setDashboardGroup } from '../../../actions';
import { selectCurrentDashboardName, selectCurrentOrgUnit } from '../../../selectors';

class FacilityScreen extends PureComponent {
  componentWillMount() {
    this.init();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.orgUnit.organisationUnitCode !== this.props.orgUnit.organisationUnitCode) {
      this.init();
    }
  }

  init() {
    window.scrollTo(0, 0);
  }

  renderFacilityImage() {
    const { orgUnit } = this.props;
    const { name } = orgUnit;
    const photoUrl = getFacilityThumbnailUrl(orgUnit);

    let imageElement;

    if (photoUrl) {
      imageElement = <img src={photoUrl} alt={name} style={styles.image} />;
    } else {
      imageElement = (
        <div style={styles.imagePlaceholder}>
          <FacilityPlaceholderIcon style={styles.imagePlacholderIcon} />
        </div>
      );
    }

    return <div style={styles.imageWrapper}>{imageElement}</div>;
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

  renderMapLink() {
    const { orgUnit } = this.props;

    if (!orgUnit.location || orgUnit.location.type === 'no-coordinates') {
      return null;
    }

    return (
      <a href={getMapUrl(orgUnit)} style={styles.mapLink} target="_blank" rel="noreferrer noopener">
        Open Map
        <MapOpenIcon style={styles.mapLinkIcon} />
      </a>
    );
  }

  render() {
    const {
      dashboards,
      orgUnit,
      currentDashboardName,
      onToggleDashboardSelectExpand,
      dashboardFilterIsExpanded,
      onChangeDashboardGroup,
    } = this.props;

    return (
      <div>
        {this.renderFacilityImage()}
        <div style={styles.contentWrapper}>
          <h1 style={styles.title}>{orgUnit.name}</h1>
          {this.renderMapLink()}
        </div>
        <Dashboard
          orgUnit={orgUnit}
          dashboards={dashboards}
          currentDashboardName={currentDashboardName}
          toggleFilter={onToggleDashboardSelectExpand}
          filterIsExpanded={dashboardFilterIsExpanded}
          handleFilterChange={onChangeDashboardGroup}
        />
        {this.renderLoading()}
        <BackButton orgUnit={orgUnit} />
      </div>
    );
  }
}

const styles = {
  spinner: {
    background: 'rgba(0,0,0,0.5)',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    padding: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2, // Above header.
  },
  imageWrapper: {
    position: 'relative',
    minHeight: 280,
    background: '#666',
    zIndex: 2, // Above floating toolbar.
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentWrapper: {
    padding: `0 ${MOBILE_MARGIN_SIZE}px`,
    background: DARK_BLUE,
    color: WHITE,
    overflow: 'hidden',
    position: 'relative',
    zIndex: 2, // Above floating toolbar.
  },
  title: {
    margin: '15px 0 0',
    lineHeight: 1.1,
    fontSize: 25,
  },
  image: {
    display: 'block',
    width: '100%',
    height: 'auto',
    backgroundColor: DARK_BLUE,
  },
  imagePlaceholder: {
    textAlign: 'center',
    color: WHITE,
    opacity: 0.6,
  },
  imagePlacholderIcon: {
    width: 50,
    height: 50,
  },
  mapLink: {
    color: WHITE,
    display: 'inline-block',
    padding: '5px 0',
    fontSize: 14,
    textDecoration: 'none',
  },
  mapLinkIcon: {
    width: 14,
    height: 14,
    verticalAlign: 'middle',
  },
};

FacilityScreen.propTypes = {
  dashboards: PropTypes.array.isRequired,
  orgUnit: PropTypes.object.isRequired,
  isLoading: PropTypes.bool,
  dashboardFilterIsExpanded: PropTypes.bool,
  currentDashboardName: PropTypes.string,
  onToggleDashboardSelectExpand: PropTypes.func.isRequired,
  onChangeDashboardGroup: PropTypes.func.isRequired,
};

FacilityScreen.defaultProps = {
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

export default connect(mapStateToProps, mapDispatchToProps)(FacilityScreen);
