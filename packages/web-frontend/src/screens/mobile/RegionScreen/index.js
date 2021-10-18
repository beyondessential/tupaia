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
import { ExpandableList } from '../../../components/mobile/ExpandableList';
import { SelectListItem } from '../../../components/mobile/SelectListItem';
import { Dashboard } from '../../../components/mobile/Dashboard';
import { filterShape } from '../../../components/mobile/FilterSelect';
import {
  setOrgUnit,
  setMapOverlay,
  toggleMeasureExpand,
  toggleDashboardSelectExpand,
  setDashboardGroup,
  clearMeasure,
} from '../../../actions';
import { DARK_BLUE, MOBILE_MARGIN_SIZE, WHITE } from '../../../styles';
import { getSingleFormattedValue } from '../../../utils/measures';
import { ENTITY_TYPE } from '../../../constants';
import {
  selectCurrentDashboardName,
  selectCurrentOrgUnit,
  selectOrgUnitChildren,
  selectCurrentMapOverlay,
} from '../../../selectors';

const MAP_WIDTH = 420;
const MAP_HEIGHT = 250;

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
      selectedFilter,
      measureFilters,
      onChangeMapOverlay,
      mobileListItems,
      onToggleMeasureExpand,
      onToggleDashboardSelectExpand,
      orgUnit,
      measureFilterIsExpanded,
      dashboardFilterIsExpanded,
      onChangeOrgUnit,
      isLoading,
      isMeasureLoading,
      currentDashboardName,
      onChangeDashboardGroup,
      title,
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
        <div>
          <ExpandableList
            items={mobileListItems.map(item => (
              <SelectListItem onSelect={onChangeOrgUnit} {...item} />
            ))}
            expandedByDefault
            title={title}
            filterTitle="Measures"
            filters={measureFilters}
            currentFilter={selectedFilter}
            onFilterChange={onChangeMapOverlay}
            filterIsExpanded={measureFilterIsExpanded}
            onFilterOpen={onToggleMeasureExpand}
            onFilterClose={onToggleMeasureExpand}
            showLoadingIcon={isMeasureLoading}
            theme={{ background: WHITE, color: '#000' }}
          />
          {mobileListItems.length === 0 && !isLoading && (
            <div style={styles.noResultText}>No clinics found in this region.</div>
          )}
          {this.renderLoading()}
        </div>
        <BackButton orgUnit={orgUnit} />
      </div>
    );
  }
}

RegionScreen.propTypes = {
  dashboards: PropTypes.array.isRequired,
  orgUnit: PropTypes.object.isRequired,
  mobileListItems: PropTypes.array,
  measureFilters: PropTypes.array,
  selectedFilter: filterShape,
  measureFilterIsExpanded: PropTypes.bool,
  onToggleMeasureExpand: PropTypes.func.isRequired,
  onChangeMapOverlay: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  isMeasureLoading: PropTypes.bool,
  onChangeOrgUnit: PropTypes.func.isRequired,
  onToggleDashboardSelectExpand: PropTypes.func.isRequired,
  dashboardFilterIsExpanded: PropTypes.bool,
  currentDashboardName: PropTypes.string,
  onChangeDashboardGroup: PropTypes.func.isRequired,
  title: PropTypes.string,
};

RegionScreen.defaultProps = {
  mobileListItems: [],
  measureFilters: [],
  measureFilterIsExpanded: false,
  selectedFilter: null,
  isLoading: false,
  isMeasureLoading: false,
  dashboardFilterIsExpanded: false,
  currentDashboardName: '',
  title: '',
};

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
  noResultText: {
    backgroundColor: WHITE,
    padding: MOBILE_MARGIN_SIZE,
  },
};

const getListItemsFromOrganisationUnitChildren = (
  organisationUnitChildren,
  isMeasureLoading,
  measureInfo,
) => {
  const { measureOptions, measureData } = measureInfo;

  if (!organisationUnitChildren) return [];

  const getSubtitle =
    isMeasureLoading || !measureData
      ? () => ''
      : code => {
          const dataItem = measureData.find(d => d.organisationUnitCode === code);
          if (!dataItem) return '';
          return getSingleFormattedValue(dataItem, measureOptions);
        };

  return organisationUnitChildren.map(({ name, organisationUnitCode, type }) => ({
    title: name,
    key: organisationUnitCode,
    orgUnitCode: organisationUnitCode,
    subTitle: getSubtitle(organisationUnitCode),
    type,
  }));
};

const getMeasureFiltersForHierarchy = mapOverlayHierarchy => {
  const results = [];

  mapOverlayHierarchy.forEach(measureObject => {
    if (measureObject.children) {
      const category = {
        category: measureObject.name,
        items: getMeasureFiltersForHierarchy(measureObject.children),
      };

      results.push(category);
    } else {
      const mapOverlay = {
        label: measureObject.name,
        code: measureObject.mapOverlayCode,
        value: measureObject,
      };

      results.push(mapOverlay);
    }
  });

  return results;
};

const mapStateToProps = state => {
  const { dashboards, isLoadingOrganisationUnit } = state.global;
  const { mapOverlayHierarchy, isExpanded } = state.mapOverlayBar;
  const { measureInfo, isMeasureLoading } = state.map;
  const { isGroupSelectExpanded } = state.dashboard;
  const currentMapOverlay = selectCurrentMapOverlay(state) || {};
  const orgUnit = selectCurrentOrgUnit(state);

  const mobileListItems = getListItemsFromOrganisationUnitChildren(
    selectOrgUnitChildren(state, orgUnit.organisationUnitCode),
    isMeasureLoading,
    measureInfo,
  );

  const title = mobileListItems.some(i => i && i.type === ENTITY_TYPE.FACILITY)
    ? 'Facilities'
    : 'Districts';

  const measureFilters = getMeasureFiltersForHierarchy(mapOverlayHierarchy);

  const selectedFilter = currentMapOverlay.mapOverlayCode
    ? { label: currentMapOverlay.name, code: `${currentMapOverlay.mapOverlayCode.toString()}` }
    : { label: '' };

  return {
    dashboards,
    currentDashboardName: selectCurrentDashboardName(state),
    orgUnit,
    mobileListItems,
    measureFilters,
    selectedFilter,
    measureFilterIsExpanded: isExpanded,
    dashboardFilterIsExpanded: isGroupSelectExpanded,
    isLoading: isLoadingOrganisationUnit,
    isMeasureLoading,
    title,
  };
};

const mapDispatchToProps = dispatch => ({
  onChangeMapOverlay: mapOverlayCode => dispatch(setMapOverlay(mapOverlayCode)),
  onClearMeasure: () => dispatch(clearMeasure()),
  onToggleMeasureExpand: () => dispatch(toggleMeasureExpand()),
  onToggleDashboardSelectExpand: () => dispatch(toggleDashboardSelectExpand()),
  onChangeOrgUnit: organisationUnitCode => dispatch(setOrgUnit(organisationUnitCode, false)),
  onChangeDashboardGroup: name => dispatch(setDashboardGroup(name)),
});

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { onChangeMapOverlay, onClearMeasure } = dispatchProps;

  return {
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
    onChangeMapOverlay: mapOverlay =>
      mapOverlay ? onChangeMapOverlay(mapOverlay.mapOverlayCode) : onClearMeasure(),
  };
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(RegionScreen);
