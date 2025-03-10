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
import styled from 'styled-components';
import { MapContainer as LeafletMapContainer, MapContainerProps } from 'react-leaflet';
import { LatLngBoundsExpression, Map as LeafletMapInterface } from 'leaflet';
import { LeafletStyles } from './LeafletStyles';
import { DEFAULT_BOUNDS } from '../constants';

export interface LeafletMapProps extends MapContainerProps {
  onPositionChanged?: (
    center: MapContainerProps['center'],
    bounds: MapContainerProps['bounds'],
    zoom: MapContainerProps['zoom'],
  ) => void;
  shouldSnapToPosition?: boolean;
}

type Bounds = LeafletMapProps['bounds'];

const Map = styled(LeafletMapContainer)<MapContainerProps>`
  ${LeafletStyles};
`;

// Don't use the Leaflet 'bounds' type here as we are referring to only array type expressions
function arePositionsEqual(a: number[], b: number[]) {
  if (a && b) {
    // if both centers are defined, equal if the position matches
    return a[0] === b[0] && a[1] === b[1];
  }
  // if either are not defined, equal only if both are not defined
  return a === b;
}

// Don't use the Leaflet 'bounds' type here as we are referring to only array type expressions
function areBoundsEqual(a: number[][], b: number[][]) {
  if (a && b) {
    return arePositionsEqual(a[0], b[0]) && arePositionsEqual(a[1], b[1]);
  }
  // if either are not defined, equal only if both are not defined
  return a === b;
}

function areBoundsValid(b: Bounds) {
  return Array.isArray(b) && b.length === 2;
}

export class LeafletMap extends Component<LeafletMapProps> {
  map: LeafletMapInterface | null;

  zooming: boolean;

  moving: boolean;

  lat: number;

  lng: number;

  zoom: number;

  minZoom: number;

  lastSentLat: number | undefined;

  lastSentLng: number | undefined;

  lastSentZoom: number | undefined;

  initialCenter: LeafletMapProps['center'];

  initialBounds: LeafletMapProps['bounds'];

  initialZoom: LeafletMapProps['zoom'];

  constructor(props: LeafletMapProps) {
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
    const { center, bounds, zoom, minZoom } = this.props;
    // set minZoom default to 3
    this.minZoom = minZoom || 3;
    this.initialCenter = center;
    this.initialBounds = areBoundsValid(bounds) ? bounds : DEFAULT_BOUNDS;
    this.initialZoom = zoom || 0;
  }

  componentDidMount = () => {
    window.addEventListener('resize', () => this.forceUpdate());
  };

  componentDidUpdate = (prevProps: LeafletMapProps) => {
    const { center, bounds, zoom } = this.props;
    if (this.map && this.requiresMoveAnimation(prevProps)) {
      if (center) {
        this.flyToPoint(center, zoom);
      } else if (bounds) {
        this.flyToBounds(bounds);
      }
    }
  };

  attachEvents = (map: LeafletMapInterface) => {
    map.on('movestart', () => {
      this.onMoveStart();
    });

    map.on('moveend', event => {
      this.onMoveEnd(event);
    });

    map.on('zoomstart', () => {
      this.onZoomStart();
    });

    map.on('zoomend', event => {
      this.onZoomEnd(event);
    });
  };

  captureMap = (map: LeafletMapInterface) => {
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

  onZoomEnd = (event: any) => {
    this.zoom = event.target.getZoom();

    this.zooming = false;
    this.onPositionChanged();
  };

  onMoveStart = () => {
    this.moving = true;
  };

  onMoveEnd = (event: any) => {
    const center = event.target.getCenter();
    this.lat = center.lat;
    this.lng = center.lng;

    this.moving = false;

    this.onPositionChanged();
  };

  onPositionChanged = () => {
    if (this.isAnimating()) return;

    const { lat, lng } = this;

    if (this.lastSentZoom !== this.zoom || this.lastSentLat !== lat || this.lastSentLng !== lng) {
      this.lastSentLat = lat;
      this.lastSentLng = lng;
      this.lastSentZoom = this.zoom;

      const { onPositionChanged } = this.props;
      if (onPositionChanged) {
        onPositionChanged({ lat, lng }, this.map?.getBounds(), this.zoom);
      }
    }

    this.refreshLayers();
  };

  flyToPoint = (center: LeafletMapProps['center'], zoom: LeafletMapProps['zoom']) => {
    if (!center) return;

    this.map?.setView(center, zoom, { animate: true });
  };

  flyToBounds = (bounds: LatLngBoundsExpression) => {
    if (!areBoundsValid(bounds)) {
      return;
    }
    this.map?.fitBounds(bounds, { animate: true });
  };

  requiresMoveAnimation = (prevProps: LeafletMapProps) => {
    const { bounds, center, zoom, shouldSnapToPosition = false } = this.props;

    if (shouldSnapToPosition) {
      if (prevProps.zoom !== zoom) {
        return true;
      }
      if (bounds) {
        // recast to number[][] to avoid typescript error, since the functions above are only handling array
        return !areBoundsEqual(bounds as number[][], prevProps.bounds as number[][]);
      }
      if (center) {
        return !arePositionsEqual(center as number[], prevProps.center as number[]);
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
        whenCreated={(map: LeafletMapInterface) => {
          this.captureMap(map);
          this.attachEvents(map);
          if (this.props.whenCreated) {
            this.props.whenCreated(map);
          }
        }}
        onClick={onClick}
        // these must be frozen to initial values as updates to them will
        // snap the map into place instead of animating it nicely
        zoom={this.initialZoom}
        minZoom={this.minZoom}
        center={this.initialCenter}
        bounds={this.initialBounds}
      >
        {children}
      </Map>
    );
  };
}
