/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
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

/*
 * Conditionally displays the value styled as an alert
 */
export const AlertCell = props => {
  const { displayValue } = props;
  // this is just temporary logic until real data is in place
  if (displayValue > 900) {
    return (
      <StyledAlert>
        {displayValue}
        <Error />
      </StyledAlert>
    );
  }

  return displayValue;
};
