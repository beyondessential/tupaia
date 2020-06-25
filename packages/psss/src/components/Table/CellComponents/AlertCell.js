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
  padding: 6px 10px;
  background: ${props => props.theme.palette.warning.light};
  border-radius: 5px;
  color: ${props => props.theme.palette.warning.main};
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;

  .MuiSvgIcon-root {
    width: 20px;
    height: 20px;
    margin-left: 5px;
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
