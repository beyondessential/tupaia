/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MuiTabs from '@material-ui/core/Tabs';
import Skeleton from '@material-ui/lab/Skeleton';
import MuiTab from '@material-ui/core/Tab';
import * as COLORS from '../constants';
import { FlexStart } from './Layout';

export const TabBar = styled(FlexStart)`
  min-height: 5.5rem;
  border-top: 1px solid ${props => props.theme.palette.grey['400']};
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
`;

const LoadingTab = () => <Skeleton width={100} height={20} style={{ marginLeft: 30 }} />;

export const TabBarLoader = () => (
  <>
    <LoadingTab />
    <LoadingTab />
    <LoadingTab />
    <LoadingTab />
  </>
);

export const TabBarTabs = styled(MuiTabs)`
  .MuiTabs-indicator {
    height: 5px;
    background-color: ${props => props.theme.palette.primary.main};
  }
`;

export const TabBarTab = styled(MuiTab)`
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

export const Tabs = styled(MuiTabs)`
  overflow: visible;
  background: ${COLORS.GREY_F9};

  .MuiTabs-scroller {
    overflow: visible !important; // overwrite the mui element style
  }

  .MuiTabs-indicator {
    display: none;
  }
`;

export const Tab = styled(MuiTab)`
  position: relative;
  text-transform: capitalize;
  opacity: 1;
  top: 1px;
  font-weight: 500;
  font-size: 1rem;
  line-height: 1.5rem;
  color: ${props => props.theme.palette.text.secondary};
  background: ${COLORS.GREY_F9};
  border-right: 1px solid ${props => props.theme.palette.grey['400']};
  border-top: 1px solid ${props => props.theme.palette.grey['400']};
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
  width: 220px;
  height: 75px;

  &:last-child {
    border-top-right-radius: 3px;
  }

  &.Mui-selected {
    background: white;
    border-bottom-color: white;
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
