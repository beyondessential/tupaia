/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { LeafletMapContainer } from '@tupaia/ui-components/lib/map';
// import { DEFAULT_BOUNDS } from './constants';
// import { LeafletStyles } from './LeafletStyles';

const DEFAULT_BOUNDS = [
  [6.5001, 110],
  [-40, 204.5],
];

const StyledMapContainer = styled(LeafletMapContainer)`
  width: auto;
  height: 100%; // leaflet container needs to have a height set to work
`;

export const MapContainer = ({
  bounds,
  className,
  defaultBounds,
  onLocationChange,
  onCreated,
  children,
  ...props
}) => {
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (map && bounds) {
      map.fitBounds(bounds);

      // provide a hook to handle location change with custom behaviour
      if (onLocationChange) {
        onLocationChange(map, bounds);
      }
    }
  }, [bounds, map]);

  const handleCreated = mapEl => {
    setMap(mapEl);

    // pass the map up to the parent
    if (onCreated) {
      onCreated(mapEl);
    }
  };

  return (
    <StyledMapContainer
      className={className}
      bounds={defaultBounds}
      scrollWheelZoom={false}
      whenCreated={handleCreated}
      zoomControl={false}
      // React Leaflet MapContainer supports all leaflet props for constructing a map. @see leaflet docs for more info
      {...props}
    >
      {children}
    </StyledMapContainer>
  );
};

MapContainer.propTypes = {
  bounds: PropTypes.array,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  defaultBounds: PropTypes.array,
  onLocationChange: PropTypes.func,
  onCreated: PropTypes.func,
};

MapContainer.defaultProps = {
  bounds: null,
  className: null,
  onLocationChange: null,
  onCreated: null,
  defaultBounds: DEFAULT_BOUNDS,
};
