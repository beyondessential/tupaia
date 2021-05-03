/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import MuiBox from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import { MapOverlayGroup } from './MapOverlayGroup';
import { MapOverlaysLoader } from './MapOverlaysLoader';
import { FlexStart } from '../Layout';
import { MapOverlaysPanelContainer as Container } from './MapOverlaysPanelContainer';

const Header = styled.div`
  padding: 1.25rem 1.875rem 2rem;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
`;

const Body = styled.div`
  padding: 0.2rem 0 2rem;
  overflow: auto;
`;

const Box = styled(MuiBox)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  margin-left: 1rem;
`;

export const MapOverlaysPanel = ({
  overlays,
  isLoadingOverlays,
  selectedOverlay,
  setSelectedOverlay,
  isLoadingData,
  YearSelector,
}) => {
  const [selectedPath, setSelectedPath] = useState(null);

  return (
    <Container>
      <Header>
        <Typography variant="h5" gutterBottom>
          Select Period:
        </Typography>
        <FlexStart>
          {YearSelector}
          {/* Todo: add better loader @see https://github.com/beyondessential/tupaia-backlog/issues/2681 */}
          <Box>{isLoadingData && <CircularProgress size={30} />}</Box>
        </FlexStart>
      </Header>
      <Body>
        {isLoadingOverlays ? (
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
  isLoadingOverlays: PropTypes.bool,
  isLoadingData: PropTypes.bool,
  selectedOverlay: PropTypes.string,
  setSelectedOverlay: PropTypes.func.isRequired,
  YearSelector: PropTypes.node.isRequired,
};

MapOverlaysPanel.defaultProps = {
  overlays: [],
  isLoadingOverlays: false,
  isLoadingData: false,
  selectedOverlay: null,
};
