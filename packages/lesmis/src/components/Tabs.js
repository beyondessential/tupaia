/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import MuiContainer from '@material-ui/core/Container';
import styled from 'styled-components';
import MuiTabs from '@material-ui/core/Tabs';
import Skeleton from '@material-ui/lab/Skeleton';
import MuiTab from '@material-ui/core/Tab';
import { NAVBAR_HEIGHT } from '../constants';
import { FlexStart } from './Layout';

const LoadingTab = () => <Skeleton width={100} height={20} style={{ marginLeft: 30 }} />;

const TabBarOuterContainer = styled.div`
  border-top: 1px solid ${props => props.theme.palette.grey['400']};
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
  background: white;
  z-index: 9999;
`;

const StickyTabBarOuterContainer = styled(TabBarOuterContainer)`
  position: sticky;
  top: ${NAVBAR_HEIGHT};
`;

const TabBarInnerContainer = styled(MuiContainer)`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

// sticks on scroll, sitting below the nav bar
export const StickyTabBar = forwardRef(({ children }, ref) => (
  <StickyTabBarOuterContainer ref={ref}>
    <TabBarInnerContainer>{children}</TabBarInnerContainer>
  </StickyTabBarOuterContainer>
));
StickyTabBar.propTypes = {
  children: PropTypes.arrayOf(PropTypes.element).isRequired,
};

export const TabBarSection = styled(FlexStart)`
  min-height: 5.5rem;
  margin-right: 0.4rem;
  padding-right: 0.4rem;
  border-right: 1px solid ${props => props.theme.palette.grey['400']};
`;

export const TabsLoader = () => (
  <>
    <LoadingTab />
    <LoadingTab />
    <LoadingTab />
    <LoadingTab />
  </>
);

export const Tabs = styled(MuiTabs)`
  .MuiTabs-indicator {
    height: 5px;
    background-color: ${props => props.theme.palette.primary.main};
  }
`;

export const Tab = styled(MuiTab)`
  min-width: auto;
  padding: 2rem 0;
  margin: 0 1rem;
  letter-spacing: 0;
  color: ${props => props.theme.palette.text.secondary};
  opacity: 1;

  &.Mui-selected {
    color: ${props => props.theme.palette.primary.main};
  }
`;

const PanelComponent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  margin-bottom: 2rem;
`;

export const TabPanel = React.memo(({ children, isSelected, Panel }) => {
  if (!isSelected) {
    return null;
  }
  return <Panel>{children}</Panel>;
});

TabPanel.propTypes = {
  children: PropTypes.node.isRequired,
  isSelected: PropTypes.bool,
  Panel: PropTypes.any,
};

TabPanel.defaultProps = {
  Panel: PanelComponent,
  isSelected: false,
};
