import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { FlexColumn } from '@tupaia/ui-components';
import { useIsFetching } from 'react-query';

import Header from './Header';

const A4Container = styled.div`
  width: 1300px;
  margin-top: 20px;
  position: absolute;
  height: 1800px;
  z-index: ${props => (props.$isSelected ? 0 : -1)};
`;

const Content = styled(FlexColumn)`
  margin: 0px 150px;
`;

export const A4Page = ({ addToRefs, children, page, currentPage, isExporting, ...configs }) => {
  const isFetching = useIsFetching() > 0;
  if (isFetching) {
    return null;
  }

  const isSelected = isExporting ? false : page === currentPage;

  return (
    <A4Container ref={addToRefs} $isSelected={isSelected}>
      <Header {...configs} />
      <Content>{children}</Content>
    </A4Container>
  );
};

A4Page.propTypes = {
  children: PropTypes.node.isRequired,
  addToRefs: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  isExporting: PropTypes.bool.isRequired,
};
