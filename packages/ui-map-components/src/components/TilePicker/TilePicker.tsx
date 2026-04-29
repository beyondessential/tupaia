import React, { useState } from 'react';
import styled from 'styled-components';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { TileButton } from './TileButton';
import { TileControl } from './TileControl';
import { createScaleKeyFrameAnimation } from './keyFrames';
import type { TileSet } from '../../types';

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

const TileList = styled.ul.attrs({ role: 'list' })`
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

interface TilePickerProps {
  tileSets: TileSet[];
  activeTileSet: TileSet;
  onChange: (tileSetKey: TileSet['key']) => void;
  className?: string;
}

const listId = 'tile-list';

export const TilePicker = ({ tileSets, activeTileSet, onChange, className }: TilePickerProps) => {
  const [open, setOpen] = useState(false);
  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Container className={className}>
        <Controls>
          <TileControl
            aria-expanded={open}
            aria-controls={listId}
            tileSet={activeTileSet}
            onClick={() => setOpen(current => !current)}
          />
        </Controls>
        <TileList className={open ? 'expanded' : 'closed'} id={listId}>
          {tileSets.map(tileSet => (
            <li key={tileSet.key}>
              <TileButton
                aria-pressed={activeTileSet.key === tileSet.key}
                onChange={onChange}
                tileSet={tileSet}
              />
            </li>
          ))}
        </TileList>
      </Container>
    </ClickAwayListener>
  );
};
