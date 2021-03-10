/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { MapContainer as LeafletMapContainer } from 'react-leaflet';
import { DEFAULT_BOUNDS } from './constants';
import { LeafletStyles } from './LeafletStyles';

const StyledMapContainer = styled(LeafletMapContainer)`
  ${LeafletStyles};
  width: auto;
  height: 500px;
`;

export const MapContainer = ({
  location,
  className,
  defaultBounds,
  onLocationChange,
  children,
  ...props
}) => {
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (map && location) {
      map.fitBounds(location.bounds);

      // provide a hook to handle location change with custom behaviour
      if (onLocationChange) {
        onLocationChange(map, location);
      }
    }
  }, [location, map]);

  return (
    <StyledMapContainer
      className={className}
      bounds={defaultBounds}
      scrollWheelZoom={false}
      whenCreated={setMap}
      // React Leaflet MapContainer supports all leaflet props for constructing a map. @see leaflet docs for more info
      {...props}
    >
      {children}
    </StyledMapContainer>
  );
};

MapContainer.propTypes = {
  location: PropTypes.object,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  defaultBounds: PropTypes.array,
  onLocationChange: PropTypes.func,
};

MapContainer.defaultProps = {
  location: null,
  className: null,
  onLocationChange: null,
  defaultBounds: DEFAULT_BOUNDS,
};
