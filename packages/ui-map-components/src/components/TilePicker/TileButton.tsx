import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { ICON_STYLES, ReferenceTooltip } from '@tupaia/ui-components';
import React from 'react';
import styled from 'styled-components';
import type { TileSet } from '../../types';

const StyledButton = styled(Button)`
  border-color: transparent;
  border-style: solid;
  border-width: 2px;
  position: relative;
  border-radius: 3px;
  margin: 1rem;
  overflow: hidden;
  padding: 0;
  text-transform: none;
  height: 8.75rem;
  min-height: 8.75rem;
  background-size: cover;
  transition: none;

  &[aria-pressed='true'] {
    border-color: ${({ theme }) =>
      theme.palette.type === 'light' ? theme.palette.primary.main : '#2196f3'};

    p {
      background-color: ${({ theme }) =>
        theme.palette.type === 'light' ? theme.palette.primary.main : '#2196f3'};
      color: white;
    }
  }
`;

const Thumbnail = styled.img.attrs({
  'aria-hidden': true,
  crossOrigin: '',
})`
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

const TileLabel = styled(Typography)`
  background: ${({ theme }) =>
    theme.palette.type === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(43, 45, 56, 0.9)'};
  color: ${({ theme }) => (theme.palette.type === 'light' ? theme.palette.text.primary : 'white')};
  font-size: 1rem;
  font-weight: normal;
  inset-block-end: 0;
  inset-inline-end: 0;
  inset-inline-start: 0;
  line-height: 1.2;
  padding-block: 0.5rem;
  padding-inline: 0.75rem;
  position: absolute;
  text-align: start;
`;

interface TileButtonProps extends React.ComponentPropsWithRef<typeof StyledButton> {
  tileSet: TileSet;
  onChange: (tileSetKey: string) => void;
}

export const TileButton = ({ tileSet, onChange, ...props }: TileButtonProps) => (
  <StyledButton onClick={() => onChange(tileSet.key)} {...props}>
    <Thumbnail src={tileSet.thumbnail} />
    <TileLabel>
      {tileSet.label}
      {tileSet.reference && (
        <ReferenceTooltip reference={tileSet.reference} iconStyle={ICON_STYLES.TILE_SET} />
      )}
    </TileLabel>
  </StyledButton>
);
