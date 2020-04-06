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
 * Tabs
 */
const TabsContext = createContext();

/**
 * Tabs are composable using `Tabs`, `TabList`, `Tab`, `TabPanels` and `TabPanel`.
 * An alternative `DataTabs` api can be used to pass in labels and panels in an array.
 */
export const Tabs = ({ children }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <TabsContext.Provider value={{ activeIndex, setActiveIndex }}>{children}</TabsContext.Provider>
  );
};

/*
 * Tab List
 */
export const TabList = ({ children }) => {
  const { activeIndex, setActiveIndex } = useContext(TabsContext);
  const handleChange = (event, newValue) => {
    setActiveIndex(newValue);
  };
  return (
    <MuiTabs
      value={activeIndex}
      onChange={handleChange}
      variant="fullWidth"
      aria-label="full width tabs example"
    >
      {children}
    </MuiTabs>
  );
};

/*
 * Tab
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

export const Tab = ({ children, ...rest }) => <StyledTab {...rest} label={children} />;

/*
 * Tab Panels
 */
export const TabPanels = ({ children }) => {
  const { activeIndex } = useContext(TabsContext);
  return children[activeIndex];
};

/*
 * Tab Panel
 */
export const TabPanel = ({ children, ...props }) => (
  <Typography component="div" {...props}>
    <Box p={3}>{children}</Box>
  </Typography>
);

/*
 * Data tabs
 *
 * Tabs with an array api
 */
export const DataTabs = ({ data }) => {
  return (
    <Tabs>
      <TabList>
        {data.map((tab, index) => (
          <Tab key={index}>{tab.label}</Tab>
        ))}
      </TabList>
      <TabPanels>
        {data.map((tab, index) => (
          <TabPanel key={index}>{tab.content}</TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  );
};
