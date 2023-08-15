import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const PreviewContainer = styled.div`
  margin-top: 20px;
  min-width: 900px;
`;

export const PreviewPage = ({ children, getNextPage, currentPage, isExporting, isError }) => {
  const page = getNextPage();
  const isSelected = isExporting || isError ? false : page === currentPage;

  if (!isSelected) {
    return null;
  }

  return <PreviewContainer>{children}</PreviewContainer>;
};

PreviewPage.propTypes = {
  children: PropTypes.node.isRequired,
  getNextPage: PropTypes.func.isRequired,
  currentPage: PropTypes.number.isRequired,
  isExporting: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
};
