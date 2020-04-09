/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useCallback } from 'react';
import MuiTabs from '@material-ui/core/Tabs';
import MuiTab from '@material-ui/core/Tab';
import styled from 'styled-components';
import * as COLORS from '../theme/colors';

/*
 * Tabs
 */
export const StyledTabs = styled(MuiTabs)`
  .MuiTabs-indicator {
    height: 3px;
  }
`;

export const Tabs = props => {
  const [value, setValue] = React.useState(0);
  const handleChange = useCallback(
    (event, newValue) => {
      setValue(newValue);
    },
    [setValue],
  );
  return <StyledTabs {...props} value={value} onChange={handleChange} />;
};

/*
 * Tab
 */
export const Tab = styled(({ children, ...rest }) => <MuiTab {...rest} label={children} />)`
  min-width: auto;
  padding: 1rem 0;
  margin: 0 1.25rem;
  text-transform: uppercase;

  .MuiTab-wrapper {
    flex-direction: row;
    justify-content: flex-start;
  }

  svg {
    margin-right: 0.625rem;
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
  color: ${COLORS.TRANSPARENT_BLUE};

  &.Mui-selected {
    color: ${props => props.theme.palette.primary.contrastText};
  }
`;
