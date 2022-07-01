import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { FlexColumn } from '@tupaia/ui-components';
import { useIsFetching } from 'react-query';

import Header from './Header';

const A4Container = styled.div`
  width: 1300px;
  margin-top: 20px;
  page-break-after: always;
`;

const Content = styled(FlexColumn)`
  margin: 0px 150px;
`;

export const A4Page = ({ children, page, currentPage, isExporting, ...configs }) => {
  const isFetching = useIsFetching() > 0;
  if (isFetching) {
    return null;
  }

  const isSelected = isExporting ? false : page === currentPage;

  return (
    <A4Container $isSelected={isSelected}>
      <Header {...configs} />
      <Content>{children}</Content>
    </A4Container>
  );
};

A4Page.propTypes = {
  children: PropTypes.node.isRequired,
  page: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  isExporting: PropTypes.bool.isRequired,
};
