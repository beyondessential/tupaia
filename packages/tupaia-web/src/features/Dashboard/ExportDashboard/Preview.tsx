import React, { useState } from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { Pagination } from '@material-ui/lab';
import { A4Page } from '@tupaia/ui-components';
import { DashboardPDFExport } from '../../../views';
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
  ${A4Page} {
    // simulate the margins of the printed page
    padding: 1cm 2.5cm 2cm;
  }
`;

const PreviewTitle = styled(Typography).attrs({
  variant: 'h2',
})`
  color: ${({ theme }) => theme.palette.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  font-size: 1rem;
  line-height: 1.4;
`;

export const Preview = ({
  selectedDashboardItems,
  separatePagePerItem,
}: {
  selectedDashboardItems: string[];
  separatePagePerItem: boolean;
}) => {
  const [page, setPage] = useState(1);
  const onPageChange = (_: unknown, newPage: number) => setPage(newPage);
  const visualisationToPreview = separatePagePerItem
    ? [selectedDashboardItems[page - 1]]
    : selectedDashboardItems;

  return (
    <PreviewPanelContainer>
      <PreviewHeaderContainer>
        <PreviewTitle>Preview</PreviewTitle>
        {separatePagePerItem && (
          <PreviewPagination
            size="small"
            siblingCount={0}
            count={selectedDashboardItems.length}
            onChange={onPageChange}
          />
        )}
      </PreviewHeaderContainer>
      <PreviewContainer>
        <DashboardPDFExport
          selectedDashboardItems={visualisationToPreview}
          isPreview={true}
          pageIndex={page}
        />
      </PreviewContainer>
    </PreviewPanelContainer>
  );
};
