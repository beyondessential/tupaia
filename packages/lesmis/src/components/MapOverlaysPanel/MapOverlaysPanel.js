/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { MapOverlayGroup } from './MapOverlayGroup';
import { MapOverlaysLoader } from './MapOverlaysLoader';
import { MapOverlaysPanelContainer as Container } from './MapOverlaysPanelContainer';

const Body = styled.div`
  padding: 0.2rem 0 2rem;
`;

export const MapOverlaysPanel = ({ overlays, isLoading, selectedOverlay, setSelectedOverlay }) => {
  const [selectedPath, setSelectedPath] = useState(null);
  return (
    <Container>
      <Body>
        {isLoading ? (
          <MapOverlaysLoader />
        ) : (
          overlays.map(({ name, children }, index) => (
            <MapOverlayGroup
              key={name}
              name={name}
              options={children}
              selectedOverlay={selectedOverlay}
              setSelectedOverlay={setSelectedOverlay}
              selectedPath={selectedPath}
              setSelectedPath={setSelectedPath}
              path={[index]}
            />
          ))
        )}
      </Body>
    </Container>
  );
};

MapOverlaysPanel.propTypes = {
  overlays: PropTypes.array,
  isLoading: PropTypes.bool,
  selectedOverlay: PropTypes.string,
  setSelectedOverlay: PropTypes.func.isRequired,
};

MapOverlaysPanel.defaultProps = {
  overlays: [],
  isLoading: false,
  selectedOverlay: null,
};
