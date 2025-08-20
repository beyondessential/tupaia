import React from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { ICON_STYLES, ReferenceTooltip } from '@tupaia/ui-components';
import { ReferenceProps } from '@tupaia/types';
import { SeriesValue } from '../../types';

const StyledButton = styled(Button)`
  position: relative;
  border-radius: 3px;
  margin: 1rem;
  font-size: 0;
  overflow: hidden;
  padding: 0;
  text-transform: none;
  height: 8.75rem;
  min-height: 8.75rem;
  background-size: cover;
  transition: none;

  &.active {
    border: 2px solid
      ${({ theme }) => (theme.palette.type === 'light' ? theme.palette.primary.main : '#2196f3')};

    p {
      background: ${({ theme }) =>
        theme.palette.type === 'light' ? theme.palette.primary.main : '#2196f3'};
      color: white;
    }
  }
`;

const Thumbnail = styled.img.attrs({
  'aria-hidden': true,
  crossOrigin: '',
})`
  object-fit: cover;
  width: 100%;
`;

const TileLabel = styled(Typography)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: absolute;
  font-weight: normal;
  font-size: 1rem;
  line-height: 1.2rem;
  bottom: 0;
  left: 0;
  right: 0;
  color: ${({ theme }) => (theme.palette.type === 'light' ? theme.palette.text.primary : 'white')};
  background: ${({ theme }) =>
    theme.palette.type === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(43, 45, 56, 0.9)'};
  padding: 0.5rem 0.75rem;
`;

// Types for a tileset
export type TileSet = {
  key: string;
  label: string;
  thumbnail: string;
  reference?: ReferenceProps;
  legendItems?: SeriesValue[];
};

interface TileButtonProps {
  tileSet: TileSet;
  isActive?: boolean;
  onChange: (tileSetKey: string) => void;
}

export const TileButton = React.memo(({ tileSet, isActive = false, onChange }: TileButtonProps) => (
  <StyledButton onClick={() => onChange(tileSet.key)} className={isActive ? 'active' : ''}>
    <Thumbnail src={tileSet.thumbnail} />
    <TileLabel>
      {tileSet.label}
      {tileSet.reference && (
        <ReferenceTooltip reference={tileSet.reference} iconStyle={ICON_STYLES.TILE_SET} />
      )}
    </TileLabel>
  </StyledButton>
));
