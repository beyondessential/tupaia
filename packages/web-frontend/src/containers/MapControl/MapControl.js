/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { ZoomControl } from './components/ZoomControl';
import { changeTileSet, changeZoom } from '../../actions';
import { getActiveTileSet } from '../../selectors';
import { TileButton } from './components/TileButton';
import { TileControl } from './components/TileControl';
import { tileSetShape } from './contants';

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
  flex-direction: column;
  background: #16161c;
  padding: 1rem;
  z-index: 1;
  overflow: auto;
  pointer-events: auto;
`;

export const MapControlComponent = ({
  tileSets,
  activeTileSet,
  onChange,
  onZoomInClick,
  onZoomOutClick,
}) => {
  const [open, toggle] = React.useState(true);
  return (
    <Container>
      <Controls>
        <ZoomControl onZoomInClick={onZoomInClick} onZoomOutClick={onZoomOutClick} />
        <TileControl tileSet={activeTileSet} onClick={() => toggle(current => !current)} />
      </Controls>
      {open && (
        <TileList>
          {tileSets.map(tileSet => (
            <TileButton
              key={tileSet.key}
              tileSet={tileSet}
              onChange={onChange}
              isActive={activeTileSet.key === tileSet.key}
            />
          ))}
        </TileList>
      )}
    </Container>
  );
};

MapControlComponent.propTypes = {
  activeTileSet: PropTypes.object.isRequired,
  tileSets: PropTypes.arrayOf(PropTypes.shape(tileSetShape)).isRequired,
  onChange: PropTypes.func.isRequired,
  onZoomInClick: PropTypes.func.isRequired,
  onZoomOutClick: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  tileSets: state.map.tileSets,
  activeTileSet: getActiveTileSet(state),
});

const mapDispatchToProps = dispatch => ({
  onChange: setKey => dispatch(changeTileSet(setKey)),
  onZoomInClick: () => dispatch(changeZoom(1)),
  onZoomOutClick: () => dispatch(changeZoom(-1)),
});

export const MapControl = connect(mapStateToProps, mapDispatchToProps)(MapControlComponent);
