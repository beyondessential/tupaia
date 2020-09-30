/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { LayerGroup, Pane } from 'react-leaflet';

import { LeafletMap } from './LeafletMap';

import MarkerLayer from './MarkerLayer';
import DisasterLayer from './DisasterLayer';
import { DemoLand } from './DemoLand';
import { TileLayer } from './TileLayer';

import { checkBoundsDifference, organisationUnitIsArea } from '../../utils';
import ConnectedPolygon from './ConnectedPolygon';

const CHANGE_TO_PARENT_PERCENTAGE = 0.6;

// for reference, built-in pane z-indices
// from https://leafletjs.com/reference-1.3.4.html#map-pane
const leafletZIndices = {
  tilePane: 200,
  overlayPane: 400,
  shadowPane: 500,
  markerPane: 600,
  tooltipPane: 650,
  popupPane: 700,
};

const MapPane = ({ above, aboveAmount = 1, ...props }) => (
  <Pane {...props} style={{ zIndex: leafletZIndices[above] + aboveAmount }} />
);

export class CustomMap extends Component {
  componentWillMount() {
    window.addEventListener('resize', () => this.forceUpdate());
  }

  shouldComponentUpdate(nextProps) {
    const {
      measureInfo,
      currentOrganisationUnit,
      tileSetUrl,
      position,
      displayedChildren,
    } = this.props;
    // Only updates/re-renders when the measure has changed or the orgUnit has changed.
    // These are the only cases where polygons or area tooltips should rerender.
    if (nextProps.measureInfo.measureId !== measureInfo.measureId) return true;

    if (nextProps.displayedChildren !== displayedChildren) return true;

    if (
      (nextProps.currentOrganisationUnit || {}).organisationUnitCode !==
      (currentOrganisationUnit || {}).organisationUnitCode
    ) {
      return true;
    }

    if (nextProps.tileSetUrl !== tileSetUrl) return true;
    if (JSON.stringify(nextProps.position) !== JSON.stringify(position)) return true;
    return false;
  }

  onPositionChanged = (center, bounds, zoom) => {
    const { position, changePosition } = this.props;

    // only check when zooming _out_
    if (zoom < position.zoom) {
      this.checkZoomOutToParentOrgUnit(bounds);
    }

    // Notify redux that we've moved
    changePosition(center, zoom);
  };

  checkZoomOutToParentOrgUnit(bounds) {
    const { currentParent, setOrgUnit } = this.props;

    // Maybe we need to zoom out to a parent!
    // First, check if there's a valid parent to zoom out to
    if (currentParent) {
      if (currentParent.location && currentParent.location.bounds) {
        // Now check if we're at a reasonable zoom level to switch to that parent
        const difference = checkBoundsDifference(currentParent.location.bounds, bounds);
        if (difference > CHANGE_TO_PARENT_PERCENTAGE) {
          setOrgUnit(currentParent.organisationUnitCode, false);
        }
      }
    }
  }

  renderPolygons() {
    const { displayedChildren, currentOrganisationUnitSiblings } = this.props;

    const areaPolygons = (displayedChildren || []).map(area => (
      <ConnectedPolygon area={area} key={area.organisationUnitCode} isChildArea />
    ));

    const siblingPolygons = (currentOrganisationUnitSiblings || []).map(area => (
      <ConnectedPolygon area={area} key={area.organisationUnitCode} />
    ));

    return [...areaPolygons, ...siblingPolygons];
  }

  renderActivePolygons() {
    const { currentOrganisationUnit } = this.props;

    // Render the currentOrgUnit polygon perimeter if it is an area (i.e. not a facility)
    if (currentOrganisationUnit && organisationUnitIsArea(currentOrganisationUnit)) {
      return (
        <ConnectedPolygon
          area={currentOrganisationUnit}
          isActive
          // Randomize key to ensure polygon appears at top. This is still imporatant even
          // though the polygon is in a LayerGroup due to issues with react-leaflet that
          // maintainer says are out of scope for the module.
          key={`currentOrgUnitPolygon${Math.random()}`}
        />
      );
    }
    return null;
  }

  render() {
    const {
      tileSetUrl,
      closeDropdownOverlays,
      sidePanelWidth,
      position,
      shouldSnapToPosition,
    } = this.props;
    return (
      <LeafletMap
        onClick={closeDropdownOverlays}
        position={position}
        shouldSnapToPosition={shouldSnapToPosition}
        rightPadding={sidePanelWidth}
        onPositionChanged={this.onPositionChanged}
      >
        <TileLayer tileSetUrl={tileSetUrl} />
        <MapPane name="demo-land" above="tilePane" aboveAmount={0}>
          <DemoLand />
        </MapPane>
        <MapPane name="org-regions-active" above="tilePane" aboveAmount={1}>
          {this.renderActivePolygons()}
        </MapPane>
        <MapPane name="org-regions" above="tilePane" aboveAmount={2}>
          {this.renderPolygons()}
        </MapPane>
        <MapPane name="org-markers" above="markerPane">
          <MarkerLayer />
        </MapPane>
        <MapPane name="disaster-markers" above="org-markers">
          <DisasterLayer />
        </MapPane>
      </LeafletMap>
    );
  }
}

CustomMap.propTypes = {
  ...Map.propTypes,
  setOrgUnit: PropTypes.func.isRequired,
  changePosition: PropTypes.func.isRequired,

  currentOrganisationUnit: PropTypes.object.isRequired,
  measureInfo: PropTypes.object.isRequired,
  displayedChildren: PropTypes.arrayOf(PropTypes.object),

  shouldSnapToPosition: PropTypes.bool.isRequired,
  position: PropTypes.shape({
    center: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    bounds: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    zoom: PropTypes.number,
  }).isRequired,
  sidePanelWidth: PropTypes.number.isRequired,
};

CustomMap.defaultProps = {
  displayedChildren: [],
};
