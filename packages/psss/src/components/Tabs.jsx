/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useCallback } from 'react';
import MuiTabs from '@material-ui/core/Tabs';
import MuiTab from '@material-ui/core/Tab';
import styled from 'styled-components';

/*
 * Tabs
 */
export const StyledTabs = styled(MuiTabs)`
  .MuiTabs-indicator {
    height: 3px;
  }
`;

export const Tabs = props => {
  const [value, setValue] = useState(0);
  const handleChange = useCallback(
    (event, newValue) => {
      setValue(newValue);
    },
    [setValue],
  );
  return <StyledTabs value={value} onChange={handleChange} variant="scrollable" {...props} />;
};

/*
 * Tab
 */
export const Tab = styled(({ children, ...rest }) => <MuiTab {...rest} label={children} />)`
  min-width: auto;
  padding: 1rem 0;
  margin: 0 1.2rem;
  text-transform: uppercase;
  letter-spacing: 0;

  .MuiTab-wrapper {
    flex-direction: row;
    justify-content: flex-start;
  }

  svg {
    margin-right: 0.5rem;
  }

  &.Mui-selected {
    color: ${props => props.theme.palette.primary.main};
  }
`;

/*
 * Light Tabs
 */
export const LightTabs = styled(Tabs)`
  .MuiTabs-indicator {
    background-color: ${props => props.theme.palette.primary.contrastText};
  }
`;

/*
 * Light Tab
 */
export const LightTab = styled(Tab)`
  color: ${props => props.theme.palette.secondary.light};

  &.Mui-selected {
    color: ${props => props.theme.palette.primary.contrastText};
  }
`;
