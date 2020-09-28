/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * MapControl
 *
 * The controls for map zoom and tile layer.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import SatelliteOnIcon from '@material-ui/icons/Visibility';
import SatelliteOffIcon from '@material-ui/icons/VisibilityOff';
import ZoomIn from '@material-ui/icons/Add';
import ZoomOut from '@material-ui/icons/Remove';
import Button from '@material-ui/core/Button';
import { changeZoom, changeTileSet } from '../../actions';
import { OFF_WHITE, TRANS_BLACK_LESS } from '../../styles';

const Container = styled.div`
  display: grid;
  justify-items: end;
  cursor: auto;
  pointer-events: auto;
  margin-bottom: 10px;
  gap: 2px;

  button {
    max-width: 30px;
    min-width: 30px;
    color: ${OFF_WHITE};
    background: ${TRANS_BLACK_LESS};
    box-shadow: none;
  }
`;

const ZoomContainer = styled.div`
  display: grid;
  font-size: 30px;

  button:first-child {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    border-bottom: none;
  }

  button:last-child {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-top: none;
  }
`;

export const MapControlComponent = ({
  currentSetKey,
  onZoomInClick,
  onZoomOutClick,
  onVisibilityClick,
}) => {
  const visibilityIcon = currentSetKey === 'osm' ? <SatelliteOffIcon /> : <SatelliteOnIcon />;
  const visiblityChangeKey = currentSetKey === 'osm' ? 'satellite' : 'osm';

  return (
    <Container>
      <Button variant="contained" onClick={() => onVisibilityClick(visiblityChangeKey)}>
        {visibilityIcon}
      </Button>

      <ZoomContainer>
        <Button variant="contained" onClick={onZoomInClick}>
          <ZoomIn />
        </Button>
        <Button variant="contained" onClick={onZoomOutClick}>
          <ZoomOut />
        </Button>
      </ZoomContainer>
    </Container>
  );
};

MapControlComponent.propTypes = {
  currentSetKey: PropTypes.string.isRequired,
  onZoomInClick: PropTypes.func.isRequired,
  onZoomOutClick: PropTypes.func.isRequired,
  onVisibilityClick: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  const currentSetKey = state.map.activeTileSetKey;
  return { currentSetKey };
};

const mapDispatchToProps = dispatch => {
  return {
    onZoomInClick: () => dispatch(changeZoom(1)),
    onZoomOutClick: () => dispatch(changeZoom(-1)),
    onVisibilityClick: setKey => dispatch(changeTileSet(setKey)),
  };
};

export const MapControl = connect(mapStateToProps, mapDispatchToProps)(MapControlComponent);
