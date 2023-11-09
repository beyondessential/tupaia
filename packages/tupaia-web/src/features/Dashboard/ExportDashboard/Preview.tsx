/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router';
import downloadJs from 'downloadjs';
import { Button, LoadingContainer } from '@tupaia/ui-components';
import { useEntity, useProject } from '../../../api/queries';
import { useExportDashboard } from '../../../api/mutations';

const ButtonGroup = styled.div`
  padding-top: 2.5rem;
  width: 100%;
  display: flex;
  justify-content: flex-end;
`;

interface ExportDashboardProps {
  onClose: () => void;
  selectedDashboardItems: string[];
}

export const Preview = ({ onClose, selectedDashboardItems = [] }: ExportDashboardProps) => {
  const { projectCode, entityCode, dashboardName } = useParams();
  const { data: project } = useProject(projectCode);
  const { data: entity } = useEntity(projectCode, entityCode);

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
