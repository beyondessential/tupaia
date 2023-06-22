/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import { Modal } from '../../../components';
import { DashboardItemType } from '../../../types';

const Wrapper = styled.div`
  width: 48rem;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  .recharts-responsive-container {
    min-height: 22.5rem;
  }
  // recharts components doesn't pass nested styles so they need to be added on a wrapping component
  li.recharts-legend-item {
    white-space: nowrap; // ensure there are no line breaks on the export legends
  }
`;

interface EnlargedDashboardItemProps {
  children: ReactNode;
  reportCode: DashboardItemType['reportCode'];
}
export const EnlargedDashboardItem = ({ children, reportCode }: EnlargedDashboardItemProps) => {
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const handleCloseModal = () => {
    urlSearchParams.delete('report');
    setUrlSearchParams(urlSearchParams.toString());
  };
  const isOpen = urlSearchParams.get('report') === reportCode;

  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal}>
      <Wrapper>
        <Container>{children}</Container>
      </Wrapper>
    </Modal>
  );
};
