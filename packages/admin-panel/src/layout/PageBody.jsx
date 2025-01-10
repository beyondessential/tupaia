import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

// This is a wrapper around the page content so that the footer is always at the bottom of the page
const PageContent = styled.div`
  flex: 1;
  padding-inline: 1.5rem;
  background-color: ${({ theme }) => theme.palette.background.paper};
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.palette.grey['400']};
  padding-inline: 0;
  max-height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
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
