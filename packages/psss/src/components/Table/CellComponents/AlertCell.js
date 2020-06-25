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
  padding: 0.375rem 0.625rem;
  background: ${props => props.theme.palette.warning.light};
  border-radius: 0.3125rem;
  color: ${props => props.theme.palette.warning.main};
  font-weight: 500;
  font-size: 1rem;
  line-height: 1.2rem;

  .MuiSvgIcon-root {
    width: 1.25rem;
    height: 1.25rem;
    margin-left: 0.3125rem;
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
