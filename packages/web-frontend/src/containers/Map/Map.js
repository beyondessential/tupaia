/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { TileLayer, LeafletMap, ZoomControl } from '@tupaia/ui-components/lib/map';

import { checkBoundsDifference } from '../../utils';
import { DemoLand } from './DemoLand';
import { DisasterLayer } from './DisasterLayer';
import {
  selectActiveTileSet,
  selectCurrentMapOverlayCodes,
  selectCurrentOrgUnit,
  selectOrgUnit,
} from '../../selectors';
import { changePosition, closeDropdownOverlays, setOrgUnit } from '../../actions';
import { TRANS_BLACK, TRANS_BLACK_LESS } from '../../styles';
import { DataVisualsLayer } from './DataVisualsLayer/DataVisualsLayer';
import { selectAreMeasuresOnTheSameEntityLevel } from '../../selectors/measureSelectors';

const CHANGE_TO_PARENT_PERCENTAGE = 0.6;

const StyledMap = styled(LeafletMap)`
  height: 100%;
  width: 100%;
  flex: 1;

  .leaflet-control-zoom {
    z-index: 1;
    border: none;
    top: -50px;
    right: 3px;

    a {
      background: ${TRANS_BLACK_LESS};
      box-shadow: none;
      border: none;
      color: white;

      &:hover {
        background: ${TRANS_BLACK};
        box-shadow: none;
      }
    }
  }
`;

/**
 * Map
 * Includes basic map setup/rendering, controlled through props that are connected to the redux store.
 * Rendering includes heatmaps markers, polygons.
 */
class MapComponent extends Component {
  componentWillMount() {
    // ensure leaflet updates after 0.5 second resize animation has finished
    window.addEventListener('resize', () => setTimeout(() => this.map?.invalidateSize(), 500));
  }

  shouldComponentUpdate(nextProps) {
    const {
      mapOverlayCodes,
      isMeasureLoading,
      position,
      tileSetUrl,
      displayedMapOverlayCodes,
    } = this.props;

    if (JSON.stringify(nextProps.mapOverlayCodes) !== JSON.stringify(mapOverlayCodes)) {
      return true;
    }
    if (isMeasureLoading && !nextProps.isMeasureLoading) {
      return true;
    }
    if (
      JSON.stringify(nextProps.displayedMapOverlayCodes) !==
      JSON.stringify(displayedMapOverlayCodes)
    ) {
      return true;
    }

    if (nextProps.tileSetUrl !== tileSetUrl) return true;

    if (JSON.stringify(nextProps.position) !== JSON.stringify(position)) return true;

    return false;
  }

  captureMap = map => {
    this.map = map;
  };

  onPositionChanged = (center, bounds, zoom) => {
    const { position, onChangePosition } = this.props;

    // only check when zooming _out_
    if (zoom < position.zoom) {
      this.checkZoomOutToParentOrgUnit(bounds);
    }

    // Notify redux that we've moved
    onChangePosition(center, zoom);
  };

  checkZoomOutToParentOrgUnit(bounds) {
    const { currentParent, onChangeOrgUnit } = this.props;

    // Maybe we need to zoom out to a parent!
    // First, check if there's a valid parent to zoom out to
    if (currentParent) {
      if (currentParent.location && currentParent.location.bounds) {
        // Now check if we're at a reasonable zoom level to switch to that parent
        const difference = checkBoundsDifference(currentParent.location.bounds, bounds);
        if (difference > CHANGE_TO_PARENT_PERCENTAGE) {
          onChangeOrgUnit(currentParent.organisationUnitCode, false);
        }
      }
    }
  }

  render() {
    const {
      displayedMapOverlayCodes,
      onCloseDropdownOverlays,
      position,
      shouldSnapToPosition,
      tileSetUrl,
      areMeasuresOnTheSameEntityLevel,
      showAttribution,
      showZoomControl,
    } = this.props;

    return (
      <StyledMap
        onClick={onCloseDropdownOverlays}
        bounds={position.bounds}
        zoom={position.zoom}
        center={position.center}
        shouldSnapToPosition={shouldSnapToPosition}
        onPositionChanged={this.onPositionChanged}
        whenCreated={this.captureMap}
      >
        <TileLayer tileSetUrl={tileSetUrl} showAttribution={showAttribution} />
        {showZoomControl && <ZoomControl position="bottomright" />}
        <DemoLand />
        {/* There are some useful cases we want to use existing logic to combine two measures on the same entity levels (eg. a coloured radius) */}
        {areMeasuresOnTheSameEntityLevel ? (
          <DataVisualsLayer displayedMapOverlayCodes={displayedMapOverlayCodes} />
        ) : (
          <>
            {displayedMapOverlayCodes.map(displayedMapOverlayCode => (
              <DataVisualsLayer
                key={displayedMapOverlayCode}
                displayedMapOverlayCodes={[displayedMapOverlayCode]}
              />
            ))}
            {displayedMapOverlayCodes.length === 0 && (
              <DataVisualsLayer displayedMapOverlayCodes={displayedMapOverlayCodes} />
            )}
          </>
        )}
        <DisasterLayer />
      </StyledMap>
    );
  }
}

MapComponent.propTypes = {
  onCloseDropdownOverlays: PropTypes.func.isRequired,
  onChangePosition: PropTypes.func.isRequired,
  currentParent: PropTypes.object,
  mapOverlayCodes: PropTypes.array.isRequired,
  displayedMapOverlayCodes: PropTypes.array.isRequired,
  position: PropTypes.shape({
    center: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    bounds: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    zoom: PropTypes.number,
  }).isRequired,
  onChangeOrgUnit: PropTypes.func.isRequired,
  onSeeOrgUnitDashboard: PropTypes.func.isRequired,
  shouldSnapToPosition: PropTypes.bool.isRequired,
  tileSetUrl: PropTypes.string.isRequired,
  areMeasuresOnTheSameEntityLevel: PropTypes.bool.isRequired,
  isMeasureLoading: PropTypes.bool,
  showZoomControl: PropTypes.bool,
  showAttribution: PropTypes.bool,
};

MapComponent.defaultProps = {
  currentParent: null,
  isMeasureLoading: false,
  showZoomControl: true,
  showAttribution: true,
};

const mapStateToProps = state => {
  const { shouldSnapToPosition, position, isMeasureLoading, displayedMapOverlays } = state.map;
  const { isSidePanelExpanded } = state.global;
  const { contractedWidth, expandedWidth } = state.dashboard;
  const currentOrganisationUnit = selectCurrentOrgUnit(state);
  const currentParent = selectOrgUnit(state, currentOrganisationUnit.parent);

  return {
    currentParent,
    isMeasureLoading,
    mapOverlayCodes: selectCurrentMapOverlayCodes(state),
    displayedMapOverlayCodes: displayedMapOverlays,
    position,
    tileSetUrl: selectActiveTileSet(state).url,
    shouldSnapToPosition,
    areMeasuresOnTheSameEntityLevel: selectAreMeasuresOnTheSameEntityLevel(state),
    sidePanelWidth: isSidePanelExpanded ? expandedWidth : contractedWidth,
  };
};

const mapDispatchToProps = dispatch => ({
  onChangeOrgUnit: (organisationUnitCode, shouldChangeMapBounds = true) => {
    dispatch(setOrgUnit(organisationUnitCode, shouldChangeMapBounds));
  },
  onSeeOrgUnitDashboard: organisationUnitCode => {
    dispatch(setOrgUnit(organisationUnitCode, true));
    dispatch(setMobileTab('dashboard'));
  },
  onChangePosition: (center, zoom) => dispatch(changePosition(center, zoom)),
  onCloseDropdownOverlays: () => dispatch(closeDropdownOverlays()),
});

export const Map = connect(mapStateToProps, mapDispatchToProps)(MapComponent);
