/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
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
import styled from 'styled-components';
import { MapContainer as LeafletMapContainer } from 'react-leaflet';
import { LeafletStyles } from './LeafletStyles';
import { DEFAULT_BOUNDS } from './constants';

const Map = styled(LeafletMapContainer)`
  ${LeafletStyles};
`;

function arePositionsEqual(a, b) {
  if (a && b) {
    // if both centers are defined, equal if the position matches
    return a[0] === b[0] && a[1] === b[1];
  }
  // if either are not defined, equal only if both are not defined
  return a === b;
}

function areBoundsEqual(a, b) {
  if (a && b) {
    return arePositionsEqual(a[0], b[0]) && arePositionsEqual(a[1], b[1]);
  }
  // if either are not defined, equal only if both are not defined
  return a === b;
}

function areBoundsValid(b) {
  return Array.isArray(b) && b.length === 2;
}

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
    const { center, bounds, zoom } = this.props;
    this.initialCenter = center;
    this.initialBounds = areBoundsValid(bounds) ? bounds : DEFAULT_BOUNDS;
    this.initialZoom = zoom || 0;
  }

  componentDidMount = () => {
    window.addEventListener('resize', () => this.forceUpdate());
  };

  componentDidUpdate = prevProps => {
    const { center, bounds, zoom } = this.props;
    if (this.map && this.requiresMoveAnimation(prevProps)) {
      if (bounds) {
        this.flyToBounds(bounds);
      } else if (center) {
        this.flyToPoint(center, zoom);
      }
    }
  };

  adjustPointToAccountForMargin = (point, zoom) => {
    const { rightPadding = 0 } = this.props;
    const projectedPoint = this.map.project(point, zoom).add([rightPadding / 2, 0]);
    return this.map.unproject(projectedPoint, zoom);
  };

  adjustPointToRemoveMargin = (point, zoom) => {
    const { rightPadding = 0 } = this.props;
    const projectedPoint = this.map.project(point, zoom).add([-rightPadding / 2, 0]);
    return this.map.unproject(projectedPoint, zoom);
  };

  attachEvents = map => {
    map.on('movestart', event => {
      this.onMoveStart(event);
    });

    map.on('moveend', event => {
      this.onMoveEnd(event);
    });

    map.on('zoomstart', event => {
      this.onZoomStart(event);
    });

    map.on('zoomend', event => {
      this.onZoomEnd(event);
    });
  };

  captureMap = map => {
    this.map = map;
    const center = this.map.getCenter();
    this.zoom = this.map.getZoom();
    this.lat = center.lat;
    this.lng = center.lng;
  };

  isAnimating = () => this.zooming || this.moving;

  onZoomStart = () => {
    this.zooming = true;
  };

  onZoomEnd = event => {
    this.zoom = event.target.getZoom();

    this.zooming = false;
    this.onPositionChanged();
  };

  onMoveStart = () => {
    this.moving = true;
  };

  onMoveEnd = event => {
    const center = event.target.getCenter();
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
    const { bounds, center, zoom, shouldSnapToPosition } = this.props;

    if (shouldSnapToPosition) {
      if (prevProps.zoom !== zoom) {
        return true;
      }
      if (bounds) {
        return !areBoundsEqual(bounds, prevProps.bounds);
      }
      if (center) {
        return !arePositionsEqual(center, prevProps.center);
      }
    }
    return false;
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

  render = () => {
    const { onClick, children } = this.props;

    return (
      <Map
        {...this.props} // pass props down to react-leaflet
        zoomControl={false}
        whenCreated={map => {
          this.captureMap(map);
          this.attachEvents(map);
        }}
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
  bounds: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  center: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  onPositionChanged: PropTypes.func,
  rightPadding: PropTypes.number,
  shouldSnapToPosition: PropTypes.bool,
  zoom: PropTypes.number,
};

LeafletMap.defaultProps = {
  bounds: null,
  center: null,
  onClick: () => {},
  onPositionChanged: () => {},
  rightPadding: 0,
  zoom: null,
  shouldSnapToPosition: false,
};
