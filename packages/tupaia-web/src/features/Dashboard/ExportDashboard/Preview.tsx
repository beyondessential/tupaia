/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { Pagination } from '@material-ui/lab';
import { PDFExport } from '../../../views';
import { MOBILE_BREAKPOINT } from '../../../constants';

const PreviewPanelContainer = styled.div`
  height: 100%;
  width: 36%;
  display: flex;
  flex-direction: column;

  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    width: 100%;
    align-items: center;
  }
`;

const PreviewHeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1.3rem;
  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    width: 100%;
  }
`;

const PreviewPagination = styled(Pagination)`
  .MuiPaginationItem-page {
    font-size: 0.7rem;
  }
`;

const PreviewContainer = styled.div`
  display: flex;
  background-color: white;
  height: 30rem;
  min-width: 20rem;
  overflow-y: auto;
  overflow-x: hidden;
`;

const PreviewTitle = styled(Typography).attrs({
  variant: 'h2',
})`
  color: ${({ theme }) => theme.palette.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  font-size: 1rem;
  line-height: 1.4;
`;

export const Preview = ({ selectedDashboardItems }: { selectedDashboardItems: string[] }) => {
  const [page, setPage] = useState(1);
  const onPageChange = (_: unknown, newPage: number) => setPage(newPage);
  const visualisationToPreview = selectedDashboardItems[page - 1];

  return (
    <PreviewPanelContainer>
      <PreviewHeaderContainer>
        <PreviewTitle>Preview</PreviewTitle>
        <PreviewPagination
          size="small"
          siblingCount={0}
          count={selectedDashboardItems.length}
          onChange={onPageChange}
        />
      </PreviewHeaderContainer>
      <PreviewContainer>
        <PDFExport selectedDashboardItems={[visualisationToPreview]} isPreview={true} />
      </PreviewContainer>
    </PreviewPanelContainer>
  );
};
