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

import MarkerLayer from './MarkerLayer'; // eslint-disable-line import/no-named-as-default
import DisasterLayer from './DisasterLayer'; // eslint-disable-line import/no-named-as-default
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
      highlightedOrganisationUnit,
      tileSet,
      position,
      innerAreas,
    } = this.props;
    // Only updates/re-renders when the measure has changed or the orgUnit has changed.
    // These are the only cases where polygons or area tooltips should rerender.
    if (nextProps.measureInfo.measureId !== measureInfo.measureId) return true;

    if (nextProps.innerAreas !== innerAreas) return true;

    if (
      nextProps.currentOrganisationUnit.organisationUnitCode !==
      currentOrganisationUnit.organisationUnitCode
    ) {
      return true;
    }
    if (
      nextProps.highlightedOrganisationUnit.organisationUnitCode !==
      highlightedOrganisationUnit.organisationUnitCode
    ) {
      return true;
    }

    if (nextProps.tileSet !== tileSet) return true;
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
    const { currentOrganisationUnit, changeOrgUnit } = this.props;

    // Maybe we need to zoom out to a parent!
    // First, check if there's a valid parent to zoom out to
    if (currentOrganisationUnit && currentOrganisationUnit.parent) {
      const parentOrg = currentOrganisationUnit.parent;
      if (parentOrg.location && parentOrg.location.bounds) {
        // Now check if we're at a reasonable zoom level to switch to that parent
        const difference = checkBoundsDifference(parentOrg.location.bounds, bounds);
        if (difference > CHANGE_TO_PARENT_PERCENTAGE) {
          changeOrgUnit(parentOrg.organisationUnitCode, false);
        }
      }
    }
  }

  renderPolygons() {
    const { innerAreas, currentOrganisationUnitSiblings, highlightedOrganisationUnit } = this.props;

    const highlightedCode = highlightedOrganisationUnit.organisationUnitCode;
    const isAreaHighlighted = area => area.organisationUnitCode === highlightedCode;

    const areaPolygons = (innerAreas || []).map(area => (
      <ConnectedPolygon area={area} key={area.organisationUnitCode} isChildArea />
    ));

    const nonHighlightedPolygons = (currentOrganisationUnitSiblings || [])
      .filter(area => !isAreaHighlighted(area))
      .map(area => <ConnectedPolygon area={area} key={area.organisationUnitCode} />);

    const highlightedPolygons = (currentOrganisationUnitSiblings || [])
      .filter(area => isAreaHighlighted(area))
      .map(area => (
        <LayerGroup key={`highlight-${area.organisationUnitCode}`}>
          <ConnectedPolygon area={area} key={area.organisationUnitCode} />
        </LayerGroup>
      ));

    return [...areaPolygons, ...nonHighlightedPolygons, ...highlightedPolygons];
  }

  renderActivePolygons() {
    const { currentOrganisationUnit } = this.props;

    // Render the currentOrgUnit polygon perimeter if it is an area (i.e. not a facility)
    if (organisationUnitIsArea(currentOrganisationUnit)) {
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
      tileSet,
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
        <TileLayer tileSet={tileSet} />
        <MapPane name="demo-land" above="tilePane" aboveAmount={0}>
          <DemoLand />
        </MapPane>
        <MapPane name="org-regions" above="tilePane" aboveAmount={1}>
          {this.renderPolygons()}
        </MapPane>
        <MapPane name="org-regions-active" above="tilePane" aboveAmount={2}>
          {this.renderActivePolygons()}
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
  changeOrgUnit: PropTypes.func.isRequired,
  changePosition: PropTypes.func.isRequired,

  /* eslint-disable react/forbid-prop-types */
  currentOrganisationUnit: PropTypes.object.isRequired,
  highlightedOrganisationUnit: PropTypes.object.isRequired,
  measureInfo: PropTypes.object.isRequired,
  /* eslint-enable react/forbid-prop-types */
  innerAreas: PropTypes.arrayOf(PropTypes.object),

  shouldSnapToPosition: PropTypes.bool.isRequired,
  position: PropTypes.shape({
    center: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    bounds: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    zoom: PropTypes.number,
  }).isRequired,
  sidePanelWidth: PropTypes.number.isRequired,
};

CustomMap.defaultProps = {
  innerAreas: [],
};
