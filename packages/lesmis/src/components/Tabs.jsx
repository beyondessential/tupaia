import React from 'react';
import PropTypes from 'prop-types';
import MuiContainer from '@material-ui/core/Container';
import styled from 'styled-components';
import MuiTabs from '@material-ui/core/Tabs';
import Skeleton from '@material-ui/lab/Skeleton';
import MuiTab from '@material-ui/core/Tab';
import { FlexStart } from './Layout';

const LoadingTab = () => <Skeleton width={100} height={20} style={{ marginLeft: 30 }} />;

const TabBarOuterContainer = styled.div`
  border-top: 1px solid ${props => props.theme.palette.grey['400']};
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
  background: white;
`;

const TabBarInnerContainer = styled(MuiContainer)`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

export const TabBar = ({ children, ...props }) => (
  <TabBarOuterContainer {...props}>
    <TabBarInnerContainer maxWidth="xl">{children}</TabBarInnerContainer>
  </TabBarOuterContainer>
);

TabBar.propTypes = {
  children: PropTypes.node.isRequired,
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

export const TabPanel = React.memo(({ children, isSelected, Panel, ...props }) => {
  if (!isSelected) {
    return null;
  }

  return <Panel {...props}>{children}</Panel>;
});

TabPanel.propTypes = {
  children: PropTypes.node.isRequired,
  isSelected: PropTypes.bool,
  Panel: PropTypes.oneOfType([PropTypes.node, PropTypes.object, PropTypes.symbol]),
};

TabPanel.defaultProps = {
  Panel: PanelComponent,
  isSelected: false,
};
