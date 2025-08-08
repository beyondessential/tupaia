import React, { ReactNode } from 'react';
import { Typography } from '@material-ui/core';
import styled from 'styled-components';
import { Tooltip } from '../Tooltip';

const PillComponent = styled.div<{
  $color?: string;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.625rem;
  min-width: 3.2rem;
  padding-block: 0.35rem 0.25rem;
  padding-inline: 0.7rem;
  ${({ $color, theme }) =>
    // apply a filter to the colour to make sure contrast with text is high enough. We do this with a linear gradient so that we can handle rgba, hex, and named colours
    $color
      ? `background: ${$color} linear-gradient(rgba(0,0,0,0.3),  rgba(0,0,0,0.3) 100%);`
      : // if the colour is not provided, apply a border
        `border: 1px solid ${theme.palette.text.primary}`};

  span & {
    cursor: pointer;
  }
`;

const Text = styled(Typography)<{
  $wrapText: boolean;
}>`
  font-size: 0.7rem;
  text-align: center;
  line-height: 1.4;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  white-space: ${({ $wrapText }) => ($wrapText ? 'normal' : 'nowrap')};
`;

interface WrapperProps {
  children: ReactNode;
  tooltip?: ReactNode;
}

const Wrapper = ({ children, tooltip }: WrapperProps) => {
  if (tooltip) {
    return (
      <Tooltip title={tooltip}>
        {/* Tooltip children need to be wrapped in an element so a ref can be applied to it */}
        <span>{children}</span>
      </Tooltip>
    );
  }

  return <>{children}</>;
};

interface PillProps {
  color?: string;
  children: ReactNode;
  tooltip?: ReactNode;
}
export const Pill = ({ color, children, tooltip }: PillProps) => {
  return (
    <Wrapper tooltip={tooltip}>
      <PillComponent $color={color}>
        {/** Slight hack to make sure that text doesn't wrap excessively inside the pills */}
        <Text $wrapText={String(children).length > 30}>{children}</Text>
      </PillComponent>
    </Wrapper>
  );
};
