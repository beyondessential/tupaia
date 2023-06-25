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
  max-width: 100%;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  .recharts-responsive-container {
    min-height: 22.5rem;
  }
`;

interface EnlargedDashboardItemProps {
  children: ReactNode;
  reportCode: DashboardItemType['reportCode'];
}
/**
 * EnlargedDashboardItem is the dashboard item modal. It is visible when the report code in the url is equal to the report code of the item.
 */
export const EnlargedDashboardItem = ({ children, reportCode }: EnlargedDashboardItemProps) => {
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  // On close, remove the report search param from the url
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
