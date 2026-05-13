import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import RightIcon from '@material-ui/icons/KeyboardArrowRight';
import React from 'react';
import styled from 'styled-components';
import type { TileSet } from '../../types';

const StyledButton = styled(Button)`
  display: block;
  pointer-events: auto;
  box-shadow: none;
  background: #34353f;
  color: ${({ theme }) => (theme.palette.type === 'light' ? theme.palette.text.primary : 'white')};
  margin-top: 0.6rem;
  margin-bottom: 1rem;
  border-radius: 3px;
  padding-block: 0.3125rem;
  padding-inline: 0.3125rem 0.9rem;
  font-weight: 500;
  font-size: 0.75rem;
  line-height: 0.85rem;
  border: none;
  text-transform: none;

  .MuiSvgIcon-root {
    margin-right: -0.9rem;
    color: ${({ theme }) =>
      theme.palette.type === 'light' ? theme.palette.text.secondary : 'white'};
    transition: color 0.3s ease;
  }

  &:hover {
    box-shadow: none;
    background: ${({ theme }) =>
      theme.palette.type === 'light' ? 'white' : 'rgba(43, 45, 56, 0.7)'};
    color: ${({ theme }) =>
      theme.palette.type === 'light' ? theme.palette.text.primary : 'white'};

    .MuiSvgIcon-root {
      color: inherit;
    }
  }
`;

const Label = styled.span`
  letter-spacing: 0;
  text-align: start;
  width: 4.65rem;
`;

const Divider = styled.span`
  border-right: 1px solid
    ${({ theme }) => (theme.palette.type === 'light' ? theme.palette.grey['400'] : 'white')};
  height: 1.5rem;
  margin-left: 0.3rem;
`;

const Legend = styled.div`
  display: flex;
  align-items: center;
`;

const LegendColor = styled.div`
  border-radius: 50%;
  width: 0.75rem;
  height: 0.75rem;
  background: ${item => item.color};
  margin-right: 0.3rem;
`;

const LegendLabel = styled(Typography)`
  font-size: 0.75rem;
  line-height: 0.85rem;
  color: ${({ theme }) =>
    theme.palette.type === 'light' ? theme.palette.text.secondary : 'white'};
  text-transform: none;
  margin-bottom: 0.3rem;
`;

const Thumbnail = styled.img.attrs({
  'aria-hidden': true,
  crossOrigin: '',
  width: 24,
  height: 24,
})`
  aspect-ratio: 1;
  block-size: 1.5rem;
  margin-inline-end: 8px;
  object-fit: cover;
  object-position: center;
`;

interface TileControlProps extends React.ComponentPropsWithRef<typeof StyledButton> {
  tileSet: TileSet;
}

export const TileControl = ({ tileSet, ...props }: TileControlProps) => (
  <StyledButton variant="contained" {...props}>
    <Box display="flex" alignItems="center">
      <Thumbnail src={tileSet.thumbnail} />
      <Label>{tileSet.label}</Label>
      <Divider aria-hidden />
      <RightIcon aria-hidden />
      <RightIcon aria-hidden />
    </Box>
    {tileSet.legendItems && (
      <Box pt={1}>
        {tileSet.legendItems.map(item => (
          <Legend key={item.color}>
            <LegendColor color={item.color} />
            <LegendLabel>{item.label}</LegendLabel>
          </Legend>
        ))}
      </Box>
    )}
  </StyledButton>
);
