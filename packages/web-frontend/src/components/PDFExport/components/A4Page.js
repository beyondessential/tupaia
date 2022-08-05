import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { FlexColumn } from '@tupaia/ui-components';

import Header from './Header';

const A4Container = styled.div`
  width: 1192px;
  margin-top: 20px;
  page-break-after: always;
  border-style: solid;
`;

const Content = styled(FlexColumn)`
  margin: 0px 70px;
`;

export const A4Page = ({ children, ...configs }) => {
  return (
    <A4Container>
      <Header {...configs} />
      <Content>{children}</Content>
    </A4Container>
  );
};

A4Page.propTypes = {
  children: PropTypes.node.isRequired,
  isExporting: PropTypes.bool.isRequired,
};
