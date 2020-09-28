/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import RightIcon from '@material-ui/icons/KeyboardArrowRight';
import { ZoomControl } from './ZoomControl';
import { OFF_WHITE, TRANS_BLACK_LESS, PRIMARY_BLUE } from '../../styles';
import { changeTileSet } from '../../actions';
import { getActiveTileSet } from '../../selectors';
import { Tile } from './Tile';

const Container = styled.div`
  height: 100%;
  display: flex;
`;

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding-right: 12px;
`;

const TileList = styled.div`
  display: flex;
  box-sizing: border-box;
  height: 100%;
  flex-direction: column;
  background: #16161c;
  // background: ${TRANS_BLACK_LESS};
  padding: 1rem;
  z-index: 1;
`;

const TileControl = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background: #2b2d38;
  background: ${TRANS_BLACK_LESS};
  color: white;
  color: ${OFF_WHITE};

  margin-top: 1rem;
  margin-bottom: 1rem;
  border-radius: 3px;
  padding: 5px 15px 5px 5px;
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

const Divider = styled.span`
  opacity: 0.2;
  border-right: 1px solid #ffffff;
  height: 25px;
  margin-left: 10px;
`;

export const MapControlComponent = ({ tileSets, activeTileSet, onChange }) => {
  const [open, toggle] = React.useState(true);
  return (
    <Container>
      <Controls>
        <ZoomControl />
        <TileControl variant="contained" onClick={() => toggle(current => !current)}>
          <img src={activeTileSet.thumbnail} alt="tile" />
          Terrain
          <Divider />
          <RightIcon />
          <RightIcon />
        </TileControl>
      </Controls>
      {open && (
        <TileList>
          {tileSets.map(tile => (
            <Tile
              key={tile.key}
              tile={tile}
              onChange={onChange}
              isActive={activeTileSet.key === tile.key}
            />
          ))}
        </TileList>
      )}
    </Container>
  );
};

const tileSetShape = PropTypes.shape({
  key: PropTypes.string,
  label: PropTypes.string,
  thumbnail: PropTypes.string,
});

MapControlComponent.propTypes = {
  activeTileSet: PropTypes.object.isRequired,
  tileSets: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  tileSets: state.map.tileSets,
  activeTileSet: getActiveTileSet(state),
});

const mapDispatchToProps = dispatch => ({
  onChange: setKey => dispatch(changeTileSet(setKey)),
});

export const MapControl = connect(mapStateToProps, mapDispatchToProps)(MapControlComponent);
