import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import MuiBox from '@material-ui/core/Box';

const ToolbarWrapper = styled.section`
  padding-top: 1.1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
`;

export const Toolbar = ({ children }) => (
  <ToolbarWrapper>
    <MuiContainer maxWidth="xl">{children}</MuiContainer>
  </ToolbarWrapper>
);

Toolbar.propTypes = {
  children: PropTypes.node.isRequired,
};

export const FlexStart = styled(MuiBox)`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

export const FlexEnd = styled(MuiBox)`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

export const FlexSpaceBetween = styled(MuiBox)`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const FlexCenter = styled(MuiBox)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const FlexColumn = styled(MuiBox)`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
