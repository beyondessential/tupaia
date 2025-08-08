import React from 'react';
import styled from 'styled-components';
import { Error } from '@material-ui/icons';

const StyledAlert = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 0.45rem 0.45rem 0.35rem 0.55rem;
  background: ${props => props.theme.palette.warning.light};
  border-radius: 0.3125rem;
  color: ${props => props.theme.palette.warning.main};
  font-weight: 500;
  font-size: 0.93rem;
  line-height: 1.2rem;

  .MuiSvgIcon-root {
    position: relative;
    width: 1.2rem;
    height: 1.2rem;
    margin-left: 0.2rem;
  }
`;

export const AlertCell = ({ displayValue, columnKey, ...props }) => {
  const key = `${columnKey} Threshold Crossed`;
  const isAlert = props[key];

  if (isAlert) {
    return (
      <StyledAlert>
        {displayValue}
        <Error />
      </StyledAlert>
    );
  }

  return displayValue ?? '-';
};
