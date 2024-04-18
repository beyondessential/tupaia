/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import PropTypes from 'prop-types';
import { Footer } from './Footer';

const MinHeightContainer = styled(MuiContainer).attrs({
  maxWidth: false,
})`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

// This is a wrapper around the main content so that the footer is always at the bottom of the page
const PageContent = styled.div`
  flex: 1;
`;

export const PageBody = ({ children, className }) => (
  <MinHeightContainer className={className}>
    <PageContent> {children}</PageContent>
    <Footer />
  </MinHeightContainer>
);

PageBody.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

PageBody.defaultProps = {
  children: null,
  className: '',
};
