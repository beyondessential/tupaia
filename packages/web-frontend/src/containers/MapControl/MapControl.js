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

function ease(v, pow = 4) {
  return 1 - Math.pow(1 - v, pow);
}

function createKeyframeAnimation() {
  // Figure out the size of the element when collapsed.
  const x = 0.5;
  const y = 0;
  let animation = '';
  let inverseAnimation = '';

  for (let step = 0; step <= 100; step++) {
    // Remap the step value to an eased one.
    const easedStep = ease(step / 100, 3);

    // Calculate the scale of the element.
    const xScale = x + (1 - x) * easedStep;
    const yScale = y + (1 - y) * easedStep;

    animation += `${step}% {
      transform: scale(${xScale}, ${yScale});
    }`;

    // And now the inverse for the contents.
    const invXScale = 1 - xScale;
    const invYScale = 1 - yScale;
    inverseAnimation += `${step}% {
      transform: scale(${invXScale}, ${invYScale});
    }`;
  }

  return `
  @keyframes openAnimation {
    ${animation}
  }

  @keyframes closeAnimation {
    ${inverseAnimation}
  }`;
}

const TileList = styled.div`
  display: flex;
  flex-direction: column;
  background: #16161c;
  z-index: 1;
  overflow: auto;
  pointer-events: auto;
  transform-origin: bottom right;
  transition: width 0.3s ease;

  ${createKeyframeAnimation()};

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
