/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router';
import downloadJs from 'downloadjs';
import { Typography, FormGroup, Divider as BaseDivider } from '@material-ui/core';
import { Pagination } from '@material-ui/lab';
import { Button, LoadingContainer, Checkbox as BaseCheckbox } from '@tupaia/ui-components';
import { useDashboards, useEntity, useProject } from '../../../api/queries';
import { useExportDashboard } from '../../../api/mutations';
import { PDFExport } from '../../../views';
import { MOBILE_BREAKPOINT } from '../../../constants';
import { useDashboardMailingList } from '../../../utils';
import { ExportSettingLabel } from './ExportSettingLabel';
import { ExportSettingsInstructions } from './ExportSettingsInstructions';
import { MailingListButton } from './MailingListButton';

const ButtonGroup = styled.div`
  padding-top: 2.5rem;
  width: 100%;
  display: flex;
  justify-content: flex-end;
`;

const PrimaryContext = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width 100%;
  align-items: start;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  flex-basis: 83.3333%;

  @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
    flex-direction: row;
  }
`;

const ExportSettingsContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-bottom: 2rem;

  @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
    width: 62%;
    margin-right: 2rem;
    margin-bottom: 0;
  }
`;

const ExportSetting = styled.div`
  border: ${({ theme }) => theme.palette.text.secondary};
  border-width: 0.1rem;
  border-style: solid;
  border-radius: 7px;

  .MuiFormGroup-root {
    align-content: start;
  }

  .MuiFormControlLabel-label {
    font-size: 0.825rem;
  }

  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 1rem;

  fieldset {
    border: 0;
  }
`;

const Checkbox = styled(BaseCheckbox)`
  margin: 0;
  .MuiButtonBase-root {
    padding: 0;
    margin-right: 0.5rem;
  }
  label {
    padding: 0.5rem 0 0 0.5rem;
  }
`;

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

const ExportSettingsInstructionsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: start;
  padding-bottom: 0.7rem;
`;

const PreviewHeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.3rem;
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
  font-size: 0.875rem;
  line-height: 1.4;
`;

const Divider = styled(BaseDivider)`
  background-color: ${({ theme }) => theme.palette.text.secondary};
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
`;

interface ExportDashboardProps {
  onClose: () => void;
  selectedDashboardItems: string[];
}

export const ExportSettings = ({ onClose, selectedDashboardItems = [] }: ExportDashboardProps) => {
  const { projectCode, entityCode, dashboardName } = useParams();
  const { data: project } = useProject(projectCode);
  const { data: entity } = useEntity(projectCode, entityCode);
  const { activeDashboard } = useDashboards(projectCode, entityCode, dashboardName);
  const mailingList = useDashboardMailingList();
  const showMailingListButton = mailingList && mailingList.isEmailAdmin;
  const [page, setPage] = useState(1);
  const onPageChange = (_: unknown, newPage: number) => setPage(newPage);
  const visualisationToPreview = selectedDashboardItems[page - 1];

  const handleExportSuccess = (data: Blob) => {
    downloadJs(data, `${exportFileName}.pdf`);
  };

  const {
    mutate: requestPdfExport,
    error,
    isLoading,
    reset,
  } = useExportDashboard({
    onSuccess: handleExportSuccess,
  });

  const exportFileName = `${project?.name}-${entity?.name}-${dashboardName}-dashboard-export`;

  const handleExport = () =>
    requestPdfExport({
      projectCode,
      entityCode,
      dashboardCode: activeDashboard.code,
      selectedDashboardItems,
    });

  return (
    <LoadingContainer
      heading="Exporting charts to PDF"
      isLoading={isLoading}
      errorMessage={error?.message}
      onReset={reset}
    >
      <PrimaryContext>
        <Container>
          <ExportSettingsContainer>
            <ExportSettingsInstructionsContainer>
              <ExportSettingsInstructions>
                Edit export settings and click 'Download'.
              </ExportSettingsInstructions>
            </ExportSettingsInstructionsContainer>
            <ExportSetting>
              <FormGroup>
                <fieldset>
                  <ExportSettingLabel>Display options (coming soon)</ExportSettingLabel>
                  <Checkbox
                    label="Export with Labels"
                    value
                    name="displayOptions"
                    color="primary"
                    checked={false}
                    disabled
                    size="small"
                  />
                  <Checkbox
                    label="Export with Table"
                    value
                    name="displayOptions"
                    color="primary"
                    checked
                    disabled
                    size="small"
                  />
                </fieldset>
              </FormGroup>
              {showMailingListButton ? <Divider /> : null}
              {showMailingListButton ? (
                <MailingListButton selectedDashboardItems={selectedDashboardItems} />
              ) : null}
            </ExportSetting>
          </ExportSettingsContainer>
          {!isLoading && (
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
                <PDFExport
                  projectCode={projectCode}
                  entityCode={entityCode}
                  dashboardName={dashboardName}
                  selectedDashboardItems={[visualisationToPreview]}
                  isPreview={true}
                />
              </PreviewContainer>
            </PreviewPanelContainer>
          )}
        </Container>
      </PrimaryContext>
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
