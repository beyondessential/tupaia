/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { TileButton } from './TileButton';
import { TileControl } from './TileControl';
import { tileSetShape } from './constants';
import { createScaleKeyFrameAnimation } from './keyFrames';

const Container = styled.div`
  height: 100%;
  display: flex;
`;

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding-right: 0.75rem;
`;

const TileList = styled.div`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => (theme.palette.type === 'light' ? '#f9f9f9' : '#16161c')};
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
    width: 12rem;
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
      transform: translate(0.6rem, 6.25rem);
    }
  }
`;

export const TilePicker = React.memo(({ tileSets, activeTileSet, onChange, className }) => {
  const [open, setOpen] = useState(false);
  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Container className={className}>
        <Controls>
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
});

TilePicker.propTypes = {
  tileSets: PropTypes.arrayOf(PropTypes.shape(tileSetShape)).isRequired,
  activeTileSet: PropTypes.shape(tileSetShape).isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};

TilePicker.defaultProps = {
  className: null,
};
