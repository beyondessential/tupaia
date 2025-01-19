import React from 'react';
import styled from 'styled-components';
import MuiButton from '@material-ui/core/Button';
import { LegendProps, Value } from '../../types';

const Button = styled(MuiButton)`
  display: flex;
  flex-direction: row;
  align-items: center;
  min-width: 0;
  padding: 0.2rem 0.5rem;
  font-weight: 400;
  letter-spacing: 0;
  pointer-events: auto;
  margin-bottom: 0.1rem;
  cursor: pointer;
  opacity: ${props => (props.hidden ? '0.5' : '1')};
  text-transform: none;

  ${p => p.theme.breakpoints.down('sm')} {
    padding: 0.05rem 0.5rem;
  }
`;

const Label = styled.div`
  font-size: 0.9375rem;
  ${p => p.theme.breakpoints.down('sm')} {
    font-size: 0.75rem;
  }
`;

interface LegendEntryProps {
  marker: React.ReactNode;
  label?: string;
  value: Value;
  dataKey?: string;
  onClick?: LegendProps['setValueHidden'];
  hiddenValues?: LegendProps['hiddenValues'];
  unClickable?: boolean;
}

export const LegendEntry = React.memo(
  ({
    marker,
    label,
    value,
    dataKey,
    onClick,
    hiddenValues = {},
    unClickable = false,
  }: LegendEntryProps) => {
    const hidden = dataKey
      ? (hiddenValues[dataKey] || {})[value as keyof typeof hiddenValues]
      : false;

    const handleClick = () => {
      if (!unClickable && onClick) {
        onClick(dataKey!, value, !hidden);
      }
    };

    return (
      <Button onClick={handleClick} hidden={hidden}>
        {marker}
        <Label>{label}</Label>
      </Button>
    );
  },
);
