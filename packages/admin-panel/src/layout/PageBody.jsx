/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

// This is a wrapper around the page content so that the footer is always at the bottom of the page
const PageContent = styled.div`
  flex: 1;
  padding-inline: 1.5rem;
`;

export const PageBody = ({ children, className }) => (
  <PageContent className={className}>{children}</PageContent>
);

PageBody.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

PageBody.defaultProps = {
  children: null,
  className: '',
};
