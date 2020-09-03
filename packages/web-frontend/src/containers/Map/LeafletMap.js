/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * LeafletMap
 *
 * Wrapper around Leaflet, to control position and zoom via props
 * while still allowing animation.
 *
 * Just using a bare react-leaflet map means that updating position/zoom/bounds
 * props snaps to that new coordinate, but we want to animate! The way to do that
 * is to get a ref to the leaflet map element and call `flyTo` and `flyToBounds`
 * but that gets complex quickly. So, this component is here to encapsulate that
 * complexity.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Map } from 'react-leaflet';

import './styles/leaflet-overrides.css';

import { initialOrgUnit } from '../../defaults';
import { arePositionsEqual, areBoundsEqual, areBoundsValid } from '../../utils/geometry';

export class LeafletMap extends Component {
  constructor(props) {
    super(props);

    // Declare some member variables to help keep track of what's going on
    // inside the leaflet element. We don't put these in state because these
    // variables are _tracking_ the child element, rather than _informing_ it.
    //
    // In pretty much every case other than wrapping external functionality,
    // member variables should be living in props or in state rather than
    // directly on the object.

    // reference to leaflet element
    this.map = null;

    // animation state of leaflet
    this.zooming = false;
    this.moving = false;

    // the last reported state of the leaflet element
    this.lat = 0;
    this.lng = 0;
    this.zoom = 0;

    // the last data we sent back up to redux
    this.lastSentLat = undefined;
    this.lastSentLng = undefined;
    this.lastSentZoom = undefined;

    // initial state of the element -- we keep sending these to leaflet so
    // that it doesn't snap to new coordinates (allowing us to animate them
    // instead)
    const { position } = this.props;
    this.initialCenter = position.center;
    this.initialBounds = areBoundsValid(position.bounds)
      ? position.bounds
      : initialOrgUnit.location.bounds;
    this.initialZoom = position.zoom || 0;
  }

  componentDidMount = () => {
    window.addEventListener('resize', () => this.forceUpdate());
  };

  componentDidUpdate = prevProps => {
    const { position } = this.props;
    if (this.map && this.requiresMoveAnimation(prevProps)) {
      if (position.bounds) {
        this.flyToBounds(position.bounds);
      } else if (position.center) {
        this.flyToPoint(position.center, position.zoom);
      }
    }
  };

  onZoomEnd = e => {
    this.zoom = e.target.getZoom();

    this.zooming = false;
    this.onPositionChanged();
  };

  onMoveEnd = e => {
    const center = e.target.getCenter();
    this.lat = center.lat;
    this.lng = center.lng;

    this.moving = false;

    this.onPositionChanged();
  };

  onPositionChanged = () => {
    if (this.isAnimating()) return;

    const { lat, lng } = this.adjustPointToRemoveMargin(
      {
        lat: this.lat,
        lng: this.lng,
      },
      this.zoom,
    );

    if (this.lastSentZoom !== this.zoom || this.lastSentLat !== lat || this.lastSentLng !== lng) {
      this.lastSentLat = lat;
      this.lastSentLng = lng;
      this.lastSentZoom = this.zoom;

      const { onPositionChanged } = this.props;
      if (onPositionChanged) {
        onPositionChanged({ lat, lng }, this.map.getBounds(), this.zoom);
      }
    }

    this.refreshLayers();
  };

  adjustPointToAccountForMargin = (point, zoom) => {
    const { rightPadding = 0 } = this.props;
    const projectedPoint = this.map.project(point, zoom).add([rightPadding / 2, 0]);
    const adjustedPoint = this.map.unproject(projectedPoint, zoom);
    return adjustedPoint;
  };

  adjustPointToRemoveMargin = (point, zoom) => {
    const { rightPadding = 0 } = this.props;
    const projectedPoint = this.map.project(point, zoom).add([-rightPadding / 2, 0]);
    const adjustedPoint = this.map.unproject(projectedPoint, zoom);
    return adjustedPoint;
  };

  flyToPoint = (center, zoom) => {
    if (!center) return;
    const coordinate = this.adjustPointToAccountForMargin(center, zoom);
    this.map.setView(coordinate, zoom, { animate: true });
  };

  flyToBounds = bounds => {
    if (!areBoundsValid(bounds)) return;
    const { rightPadding = 0 } = this.props;
    this.map.fitBounds(bounds, {
      animate: true,
      paddingBottomRight: [rightPadding, 0],
    });
  };

  requiresMoveAnimation = prevProps => {
    const { position, shouldSnapToPosition } = this.props;
    const prevPosition = prevProps.position;

    if (shouldSnapToPosition) {
      if (prevPosition.zoom !== position.zoom) {
        return true;
      }
      if (position.bounds) {
        return !areBoundsEqual(position.bounds, prevPosition.bounds);
      }
      if (position.center) {
        return !arePositionsEqual(position.center, prevPosition.center);
      }
    }
    return false;
  };

  captureMap = ref => {
    if (ref) {
      this.map = ref.leafletElement;

      const center = this.map.getCenter();
      this.zoom = this.map.getZoom();
      this.lat = center.lat;
      this.lng = center.lng;
    }
  };

  refreshLayers = () => {
    // re-render layers that have automatic positioning
    // (ie, tooltips)
    if (this.map) {
      this.map.eachLayer(layer => {
        if (layer.options.direction && layer.options.direction === 'auto') {
          layer.update();
        }
      });
    }
  };

  isAnimating = () => this.zooming || this.moving;

  render = () => {
    const { onClick, children } = this.props;

    return (
      <Map
        style={{ height: window.innerHeight, width: '100%' }}
        zoomControl={false}
        onZoomend={this.onZoomEnd}
        onZoomstart={() => {
          this.zooming = true;
        }}
        onMoveend={this.onMoveEnd}
        onMovestart={() => {
          this.moving = true;
        }}
        ref={this.captureMap}
        onClick={onClick}
        // these must be frozen to initial values as updates to them will
        // snap the map into place instead of animating it nicely
        zoom={this.initialZoom}
        center={this.initialCenter}
        bounds={this.initialBounds}
      >
        {children}
      </Map>
    );
  };
}

LeafletMap.propTypes = {
  // presentational
  rightPadding: PropTypes.number,

  // view bounds
  shouldSnapToPosition: PropTypes.bool.isRequired,
  position: PropTypes.shape({
    zoom: PropTypes.number,
    center: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    bounds: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  }).isRequired,

  // handlers
  onClick: PropTypes.func,
  onPositionChanged: PropTypes.func,

  children: PropTypes.node.isRequired,
};

LeafletMap.defaultProps = {
  rightPadding: 0,
  onClick: undefined,
  onPositionChanged: undefined,
};
