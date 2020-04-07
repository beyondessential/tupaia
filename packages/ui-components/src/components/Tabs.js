/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import MuiTabs from '@material-ui/core/Tabs';
import MuiTab from '@material-ui/core/Tab';
import styled from 'styled-components';
import * as COLORS from '../theme/colors';

/*
 * Tabs
 */
export const Tabs = props => {
  const [value, setValue] = React.useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  return <MuiTabs {...props} value={value} onChange={handleChange} />;
};

/*
 * Tab
 */
const StyledTab = styled(MuiTab)`
  padding: 16px 12px;

  &.Mui-selected {
    color: ${props => props.theme.palette.primary.main};
  }
`;

export const Tab = ({ children, ...rest }) => <StyledTab {...rest} label={children} />;

/*
 * Light Tabs
 */
const StyledLightTabs = styled(Tabs)`
  .MuiTabs-indicator {
    background-color: ${props => props.theme.palette.primary.contrastText};
  }
`;

export const LightTabs = props => <StyledLightTabs {...props} />;

/*
 * Light Tab
 */
const StyledLightTab = styled(MuiTab)`
  min-width: auto;
  padding: 16px 0;
  margin: 0 2rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;

  .MuiTab-wrapper {
    flex-direction: row;
    justify-content: flex-start;
  }
  
  svg {
    margin-right: 0.5rem;
  }

  &.Mui-selected {
    color: ${props => props.theme.palette.primary.contrastText};
  }
`;

export const LightTab = ({ children, ...rest }) => <StyledLightTab {...rest} label={children} />;
