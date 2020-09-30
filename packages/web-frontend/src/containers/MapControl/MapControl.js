/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { ZoomControl } from './components/ZoomControl';
import { changeTileSet, changeZoom } from '../../actions';
import { TileButton } from './components/TileButton';
import { TileControl } from './components/TileControl';
import { tileSetShape } from './contants';
import { selectTileSets, selectActiveTileSet } from '../../selectors/projectSelectors';
import { createScaleKeyFrameAnimation } from '../../utils/keyFrames';

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
  z-index: 1;
  overflow: auto;
  pointer-events: auto;
  transform-origin: bottom right;
  transition: width 0.3s ease;

  ${createScaleKeyFrameAnimation({})};

  > button {
    transition: transform 0.5s ease-out;
  }

  // animations
  &.expanded {
    width: 192px;
    animation-name: openAnimation;
    animation-duration: 0.4s;
    animation-timing-function: linear;

    > button {
      transform: translate(0, 0);
    }
  }

  &.closed {
    width: 0;
    animation-name: closeAnimation;
    transform: scale(0, 0);
    animation-duration: 0.6s;
    animation-timing-function: linear;

    > button {
      transform: translate(10px, 100px);
    }
  }
`;

export const MapControlComponent = ({
  tileSets,
  activeTileSet,
  onChange,
  onZoomInClick,
  onZoomOutClick,
}) => {
  const [open, setOpen] = React.useState(false);
  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Container>
        <Controls>
          <ZoomControl onZoomInClick={onZoomInClick} onZoomOutClick={onZoomOutClick} />
          <TileControl
            isActive={open}
            tileSet={activeTileSet}
            onClick={() => setOpen(current => !current)}
          />
        </Controls>
        <TileList className={open ? 'expanded' : 'closed'}>
          {tileSets.map(tileSet => (
            <TileButton
              key={tileSet.key}
              tileSet={tileSet}
              onChange={onChange}
              isActive={activeTileSet.key === tileSet.key}
            />
          ))}
        </TileList>
      </Container>
    </ClickAwayListener>
  );
};

MapControlComponent.propTypes = {
  activeTileSet: PropTypes.shape(tileSetShape).isRequired,
  tileSets: PropTypes.arrayOf(PropTypes.shape(tileSetShape)).isRequired,
  onChange: PropTypes.func.isRequired,
  onZoomInClick: PropTypes.func.isRequired,
  onZoomOutClick: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  tileSets: selectTileSets(state),
  activeTileSet: selectActiveTileSet(state),
});

const mapDispatchToProps = dispatch => ({
  onChange: setKey => dispatch(changeTileSet(setKey)),
  onZoomInClick: () => dispatch(changeZoom(1)),
  onZoomOutClick: () => dispatch(changeZoom(-1)),
});

export const MapControl = connect(mapStateToProps, mapDispatchToProps)(MapControlComponent);
