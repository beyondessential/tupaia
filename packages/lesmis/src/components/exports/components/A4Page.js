import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import Header from './Header';

const A4Container = styled.div`
  width: 1300px;
  margin-top: 20px;
  position: absolute;
  z-index: ${props => (props.$isSelected ? 0 : -1)};
`;

const Content = styled.div`
  margin: 0px 150px;
`;

export const A4Page = ({ addToRefs, children, dashboardLabel, page, currentPage }) => {
  const isSelected = page === currentPage;

  return (
    <A4Container ref={addToRefs} $isSelected={isSelected}>
      <Header dashboardLabel={dashboardLabel} />
      <Content> {children}</Content>
    </A4Container>
  );
};

A4Page.propTypes = {
  children: PropTypes.node.isRequired,
  addToRefs: PropTypes.func.isRequired,
  dashboardLabel: PropTypes.string.isRequired,
  page: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
};
