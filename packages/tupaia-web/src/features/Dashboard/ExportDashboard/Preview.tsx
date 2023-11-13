/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router';
import downloadJs from 'downloadjs';
import { Button, LoadingContainer } from '@tupaia/ui-components';
import { useEntity, useProject } from '../../../api/queries';
import { useExportDashboard } from '../../../api/mutations';
import { PDFExport } from '../../../views';
import { Typography } from '@material-ui/core';
import { Pagination } from '@material-ui/lab';

const ButtonGroup = styled.div`
  padding-top: 2.5rem;
  width: 100%;
  display: flex;
  justify-content: flex-end;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-basis: 83.3333%;
`;

const PreviewPanelContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const PreviewHeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.3rem;
`;

const PreviewPagination = styled(Pagination)`
  .MuiPaginationItem-page {
    font-size: 0.7rem;
  }
`;

const PreviewContainer = styled.div`
  display: flex;
  background-color: white;
  height: 27rem;
  width: 40rem;
  overflow: auto;
`;

const Title = styled(Typography)`
  color: white;
  font-weight: 400;
  font-size: 0.875rem;
  line-height: 1.4;
`;

interface ExportDashboardProps {
  onClose: () => void;
  selectedDashboardItems: string[];
}

export const Preview = ({ onClose, selectedDashboardItems = [] }: ExportDashboardProps) => {
  const { projectCode, entityCode, dashboardName } = useParams();
  const { data: project } = useProject(projectCode);
  const { data: entity } = useEntity(projectCode, entityCode);
  const [page, setPage] = useState(1);
  const onPageChange = (_: unknown, newPage: number) => setPage(newPage);
  const visualisationToPreview = selectedDashboardItems[page - 1];

  const handleExportSuccess = (data: Blob) => {
    downloadJs(data, `${exportFileName}.pdf`);
  };

  const { mutate: requestPdfExport, error, isLoading, reset } = useExportDashboard({
    onSuccess: handleExportSuccess,
  });

  const exportFileName = `${project?.name}-${entity?.name}-${dashboardName}-dashboard-export`;

  const handleExport = () =>
    requestPdfExport({
      projectCode,
      entityCode,
      dashboardName,
      selectedDashboardItems,
    });

  return (
    <LoadingContainer
      heading="Exporting charts to PDF"
      isLoading={isLoading}
      errorMessage={error?.message}
      onReset={reset}
    >
      <Container>
        <PreviewPanelContainer>
          <PreviewHeaderContainer>
            <Title>Preview</Title>
            <PreviewPagination
              size="small"
              siblingCount={0}
              count={selectedDashboardItems.length}
              onChange={onPageChange}
            />
          </PreviewHeaderContainer>
          <PreviewContainer>
            <PDFExport
              projectCode={projectCode}
              entityCode={entityCode}
              dashboardName={dashboardName}
              selectedDashboardItems={[visualisationToPreview]}
              isPreview
            />
          </PreviewContainer>
        </PreviewPanelContainer>
      </Container>
      <ButtonGroup>
        <Button variant="outlined" color="default" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" onClick={handleExport} disabled={isLoading}>
          Download
        </Button>
      </ButtonGroup>
    </LoadingContainer>
  );
};
