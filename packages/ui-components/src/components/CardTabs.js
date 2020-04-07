/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState, createContext, useContext, Children } from 'react';
import MuiTabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import MuiTab from '@material-ui/core/Tab';
import styled from 'styled-components';
import * as COLORS from '../theme/colors';

/*
 * CardTabs
 */
const TabsContext = createContext();

/**
 * CardTabs are composable using `CardTabs`, `TabList`, `Tab`, `TabPanels` and `TabPanel`.
 * An alternative `DataTabs` api can be used to pass in labels and panels in an array.
 */
export const CardTabs = ({ children }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <TabsContext.Provider value={{ activeIndex, setActiveIndex }}>{children}</TabsContext.Provider>
  );
};

/*
 * CardTab List
 */
const StyledTabs = styled(MuiTabs)`
  .MuiTabs-indicator {
    display: none;
  }
`;

export const CardTabList = ({ children }) => {
  const { activeIndex, setActiveIndex } = useContext(TabsContext);
  const handleChange = (event, newValue) => {
    setActiveIndex(newValue);
  };
  return (
    <StyledTabs
      value={activeIndex}
      onChange={handleChange}
      variant="fullWidth"
    >
      {children}
    </StyledTabs>
  );
};

/*
 * CardTab
 */
const StyledTab = styled(MuiTab)`
  border-right: 1px solid ${COLORS.GREY_DE};
  border-bottom: 1px solid ${COLORS.GREY_DE};
  background: ${COLORS.GREY_FB};
  color: ${COLORS.GREY_9F};
  padding: 16px 12px;

  &:last-child {
    border-right: none;
  }

  &.Mui-selected {
    background: white;
    color: ${props => props.theme.palette.primary.main};
    border-bottom: 1px solid transparent;
  }
`;

export const CardTab = ({ children, ...rest }) => <StyledTab {...rest} label={children} />;

/*
 * CardTab Panels
 */
export const CardTabPanels = ({ children }) => {
  const { activeIndex } = useContext(TabsContext);
  return children[activeIndex];
};

/*
 * Card Tab Panel
 */
export const CardTabPanel = ({ children, ...props }) => (
  <Typography component="div" {...props}>
    <Box p={3}>{children}</Box>
  </Typography>
);

/*
 * DataTabs
 *
 * CardTabs with an array api
 */
export const DataCardTabs = ({ data }) => {
  return (
    <CardTabs>
      <CardTabList>
        {data.map((tab, index) => (
          <CardTab key={index}>{tab.label}</CardTab>
        ))}
      </CardTabList>
      <CardTabPanels>
        {data.map((tab, index) => (
          <CardTabPanel key={index}>{tab.content}</CardTabPanel>
        ))}
      </CardTabPanels>
    </CardTabs>
  );
};
