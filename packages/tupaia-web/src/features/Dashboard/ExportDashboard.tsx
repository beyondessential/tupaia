/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router';
import downloadJs from 'downloadjs';
import { Button, CheckboxList, ListItemProps, LoadingContainer } from '@tupaia/ui-components';
import { DashboardItem } from '../../types';
import { Modal } from '../../components';
import { useEntity, useProject } from '../../api/queries';
import { useExportDashboard } from '../../api/mutations';

const Wrapper = styled.div`
  width: 56rem;
  max-width: 100%;
  padding: 2.5rem 1.875rem 0rem 1.875rem;
  display: flex;
  justify-content: center;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-basis: 83.3333%;
  button {
    text-transform: none;
  }
  .loading-screen {
    background-color: ${props => props.theme.palette.background.paper};
    border: 0;
    button {
      padding: 0.5em 1.75em;
      font-size: 1rem;
    }
  }
`;

const ButtonGroup = styled.div`
  padding-top: 2.5rem;
  width: 100%;
  display: flex;
  justify-content: flex-end;
`;

interface ExportDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  dashboardItems?: DashboardItem[];
}

export const ExportDashboard = ({ isOpen, onClose, dashboardItems }: ExportDashboardProps) => {
  const { projectCode, entityCode, dashboardName } = useParams();
  const { data: project } = useProject(projectCode);
  const { data: entity } = useEntity(projectCode, entityCode);
  const [selectedItems, setSelectedItems] = useState<ListItemProps[]>([]);

  const handleExportSuccess = (data: Blob) => {
    downloadJs(data, `${exportFileName}.pdf`);
  };

  const { mutate: requestPdfExport, error, isLoading, reset } = useExportDashboard({
    onSuccess: handleExportSuccess,
  });

  const list =
    dashboardItems?.map(({ config, code }) => ({
      name: config?.name,
      code,
      disabled: config?.type !== 'chart',
      tooltip: config?.type !== 'chart' ? 'PDF export coming soon' : undefined,
    })) ?? [];

  const exportFileName = `${project?.name}-${entity?.name}-${dashboardName}-dashboard-export`;

  const handleExport = () =>
    requestPdfExport({
      projectCode,
      entityCode,
      dashboardName,
      selectedDashboardItems: selectedItems.map(({ code }) => code),
    });

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Wrapper>
        <Container>
          <LoadingContainer
            heading="Exporting charts to PDF"
            isLoading={true}
            errorMessage={error?.message}
            onReset={reset}
          >
            <CheckboxList
              title="Select Visualisations"
              list={list}
              selectedItems={selectedItems}
              setSelectedItems={setSelectedItems}
            />
            <ButtonGroup>
              <Button variant="outlined" color="default" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleExport}
                disabled={selectedItems.length === 0 || isLoading}
              >
                Download
              </Button>
            </ButtonGroup>
          </LoadingContainer>
        </Container>
      </Wrapper>
    </Modal>
  );
};
