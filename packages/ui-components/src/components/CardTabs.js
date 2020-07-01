/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState, createContext, useContext, useCallback } from 'react';
import MuiTabs from '@material-ui/core/Tabs';
import PropTypes from 'prop-types';
import MuiTab from '@material-ui/core/Tab';
import styled from 'styled-components';

const TabsContext = createContext(null);

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

CardTabs.propTypes = {
  children: PropTypes.array.isRequired,
};

const StyledTabs = styled(MuiTabs)`
  .MuiTabs-indicator {
    display: none;
  }
`;

export const CardTabList = ({ children, Context }) => {
  const { activeIndex, setActiveIndex } = useContext(Context);
  const handleChange = useCallback(
    (event, newValue) => {
      setActiveIndex(newValue);
    },
    [setActiveIndex],
  );
  return (
    <StyledTabs value={activeIndex} onChange={handleChange} variant="fullWidth">
      {children}
    </StyledTabs>
  );
};

CardTabList.propTypes = {
  children: PropTypes.array.isRequired,
  Context: PropTypes.object,
};

CardTabList.defaultProps = {
  Context: TabsContext,
};

export const CardTab = styled(({ children, ...props }) => <MuiTab {...props} label={children} />)`
  border-right: 1px solid ${props => props.theme.palette.grey['400']};
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
  background: ${props => props.theme.palette.grey['100']};
  color: ${props => props.theme.palette.grey['500']};
  padding: 1rem 0.75rem;
  min-width: 5rem;

  &:last-child {
    border-right: none;
  }

  &.Mui-selected {
    background: white;
    color: ${props => props.theme.palette.primary.main};
    border-bottom: 1px solid transparent;
  }
`;

export const CardTabPanels = ({ children, Context }) => {
  const { activeIndex } = useContext(Context);
  return children[activeIndex];
};

CardTabPanels.propTypes = {
  children: PropTypes.array.isRequired,
  TabsContext: PropTypes.object,
};

CardTabPanels.defaultProps = {
  Context: TabsContext,
};

export const CardTabPanel = styled.div`
  padding: 1.5rem;
`;

/*
 * CardTabs with an array api. Each entry in 'data' should contain 'label' and 'content' fields.
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

DataCardTabs.propTypes = {
  data: PropTypes.array.isRequired,
};
