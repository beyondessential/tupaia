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
// import './leaflet-overrides.css';
// import { DEFAULT_BOUNDS } from '../../defaults';
// import { arePositionsEqual, areBoundsEqual, areBoundsValid } from '../../utils/geometry';
// import { TRANS_BLACK, TRANS_BLACK_LESS } from '../../styles';

export const TRANS_BLACK = 'rgba(43, 45, 56, 0.94)';
export const TRANS_BLACK_LESS = 'rgba(43, 45, 56, 0.8)';

const DEFAULT_BOUNDS = [
  // Note: There's a little bit of a hack going on here, the bounds[0] for explore are actually [6.5, 110]
  // However in order to trigger the map to re-render we set them slightly adjusted as [6.5001, 110]
  // See: https://github.com/beyondessential/tupaia-backlog/issues/540#issuecomment-631314721
  [6.5001, 110],
  [-40, 204.5],
];

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

const Map = styled(LeafletMapContainer)`
  .leaflet-control-zoom {
    z-index: 1;
    border: none;
    top: -50px;
    right: 350px;
    transition: right 0.5s ease;

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
    this.initialBounds = areBoundsValid(position.bounds) ? position.bounds : DEFAULT_BOUNDS;
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

  onZoomStart = () => {
    this.zooming = true;
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

  onMoveStart = () => {
    this.moving = false;
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
    return this.map.unproject(projectedPoint, zoom);
  };

  adjustPointToRemoveMargin = (point, zoom) => {
    const { rightPadding = 0 } = this.props;
    const projectedPoint = this.map.project(point, zoom).add([-rightPadding / 2, 0]);
    return this.map.unproject(projectedPoint, zoom);
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

  captureMap = mapEl => {
    if (mapEl) {
      this.map = mapEl;
      const center = this.map.getCenter();
      this.zoom = this.map.getZoom();
      this.lat = center.lat;
      this.lng = center.lng;
    }
  };

  attachEvents = () => {
    const { map } = this;

    map.on('movestart', event => {
      this.movestart(event);
    });

    map.on('moveend', event => {
      this.onMoveEnd(event);
    });

    map.on('zoomstart', event => {
      this.zoomstart(event);
    });

    map.on('zoomend', event => {
      this.onZoomEnd(event);
    });
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
        {...this.props} // pass props down to react-leaflet
        style={{ height: '100vh', width: '100%' }}
        zoomControl={false}
        whenCreated={this.captureMap}
        onClick={onClick}
        // these must be frozen to initial values as updates to them will
        // snap the map into place instead of animating it nicely
        zoom={this.initialZoom}
        center={this.initialCenter}
        bounds={this.initialBounds}
        scrollWheelZoom={false}
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
