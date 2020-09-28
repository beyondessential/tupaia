/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import SatelliteOnIcon from '@material-ui/icons/Visibility';
import SatelliteOffIcon from '@material-ui/icons/VisibilityOff';
import RightIcon from '@material-ui/icons/KeyboardArrowRight';
import { ZoomControl } from './ZoomControl';

const Container = styled.div`
  height: 100%;
`;

const Tiles = styled.div`
  display: flex;
  box-sizing: border-box;
  height: 100%;
  flex-direction: column;
  background: #16161c;
  padding: 1rem;
`;

const TileControl = styled.div`
  position: absolute;
  bottom: 0;
  right: 100%;
  padding-right: 12px;
`;

const TileControlButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background: #2b2d38;
  margin-top: 1rem;
  margin-bottom: 1rem;
  border-radius: 3px;
  padding: 5px 15px 5px 5px;
  color: white;
  font-weight: 500;
  font-size: 12px;
  line-height: 14px;
  border: none;

  img {
    height: 25px;
    margin-right: 8px;
  }

  .MuiSvgIcon-root {
    margin-right: -15px;
    color: #2196f3;
  }
`;

const Tile = styled(Button)`
  position: relative;
  border-radius: 3px;
  margin-bottom: 1rem;
  font-size: 0;
  overflow: hidden;
  padding: 0;

  img {
    border-radius: 3px;
  }
`;

const TileFooter = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: #2b2d38;
  padding: 8px 12px;
  opacity: 0.9;
  border-radius: 0 0 3px 3px;
`;

const TileLabel = styled(Typography)`
  font-weight: normal;
  font-size: 16px;
  line-height: 19px;
  color: white;
`;

const Divider = styled.span`
  opacity: 0.2;
  border-right: 1px solid #ffffff;
  height: 25px;
  margin-left: 10px;
`;

export const MapControlComponent = ({ tiles }) => {
  const [mapLayer, setMapLayer] = React.useState('osm');

  const handleChange = () => {
    setMapLayer(current => (current === 'osm' ? 'satellite' : 'osm'));
  };

  const visibilityIcon = mapLayer === 'osm' ? <SatelliteOffIcon /> : <SatelliteOnIcon />;

  return (
    <Container>
      <TileControl>
        <ZoomControl />
        <TileControlButton>
          <img src={tiles[0].thumbnail} alt="tile" />
          Terrain
          <Divider />
          <RightIcon />
          <RightIcon />
        </TileControlButton>
      </TileControl>
      <Tiles>
        {tiles.map(tile => (
          <Tile key={tile.label}>
            <img src={tile.thumbnail} alt="tile" />
            <TileFooter>
              <TileLabel>{tile.label}</TileLabel>
            </TileFooter>
          </Tile>
        ))}
      </Tiles>
    </Container>
  );
};

MapControlComponent.propTypes = {
  tiles: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      thumbnail: PropTypes.string,
    }),
  ).isRequired,
};
