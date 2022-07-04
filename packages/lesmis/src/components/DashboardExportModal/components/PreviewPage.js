import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { FlexColumn } from '@tupaia/ui-components';

import Header from './Header';

const PreviewContainer = styled.div`
  margin-top: 20px;
  min-width: 900px;
`;

const Content = styled(FlexColumn)`
  margin: 0px 150px;
`;

export const PreviewPage = ({ children, getNextPage, currentPage, isExporting, ...configs }) => {
  const page = getNextPage();
  const isSelected = isExporting ? false : page === currentPage;

  if (!isSelected) {
    return null;
  }

  return (
    <PreviewContainer>
      <Header {...configs} />
      <Content>{children}</Content>
    </PreviewContainer>
  );
};

PreviewPage.propTypes = {
  children: PropTypes.node.isRequired,
  getNextPage: PropTypes.func.isRequired,
  currentPage: PropTypes.number.isRequired,
  isExporting: PropTypes.bool.isRequired,
};
