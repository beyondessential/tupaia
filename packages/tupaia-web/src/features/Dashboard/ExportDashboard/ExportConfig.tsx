/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router';
import downloadJs from 'downloadjs';
import { FormGroup } from '@material-ui/core';
import { Button, LoadingContainer, Checkbox as BaseCheckbox } from '@tupaia/ui-components';
import { useEntity, useProject } from '../../../api/queries';
import { useExportDashboard } from '../../../api/mutations';
import { DashboardItemVizTypes, MOBILE_BREAKPOINT } from '../../../constants';
import { ExportSettingLabel } from '../../ExportSettings';
import { useDashboard } from '../utils';
import { ExportSubtitle } from './ExportSubtitle';
import { MailingListSection } from './MailingListSection';
import { Preview } from './Preview';

const ButtonGroup = styled.div`
  padding-top: 2.5rem;
  width: 100%;
  display: flex;
  justify-content: flex-end;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width 100%;
  align-items: start;
  section + section {
    margin-top: 1.5rem;
    border-top: 0.1rem solid ${({ theme }) => theme.palette.text.secondary};
    padding-top: 1.5rem;
  }
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
    font-size: 0.875rem;
  }

  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 1rem;

  fieldset {
    border: 0;
  }
`;

const ExportSettingsInstructionsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: start;
  padding-bottom: 1.4rem;
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

interface ExportDashboardProps {
  onClose: () => void;
  selectedDashboardItems: string[];
}

export const ExportConfig = ({ onClose, selectedDashboardItems }: ExportDashboardProps) => {
  const { projectCode, entityCode, dashboardName } = useParams();
  const { data: project } = useProject(projectCode);
  const { data: entity } = useEntity(projectCode, entityCode);
  const { activeDashboard } = useDashboard();

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
      dashboardCode: activeDashboard?.code,
      selectedDashboardItems,
    });

  const hasChartItems = selectedDashboardItems.some(code => {
    const item = activeDashboard?.items.find(({ code: itemCode }) => itemCode === code);

    return item?.config?.type === DashboardItemVizTypes.Chart;
  });

  return (
    <LoadingContainer
      heading="Exporting charts to PDF"
      isLoading={isLoading}
      errorMessage={error?.message}
      onReset={reset}
    >
      <Wrapper>
        <Container>
          <ExportSettingsContainer>
            <ExportSettingsInstructionsContainer>
              <ExportSubtitle>Edit export settings and click 'Download'.</ExportSubtitle>
            </ExportSettingsInstructionsContainer>
            <ExportSetting>
              {hasChartItems && (
                <section>
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
                </section>
              )}
              <MailingListSection selectedDashboardItems={selectedDashboardItems} />
            </ExportSetting>
          </ExportSettingsContainer>
          {!isLoading && <Preview selectedDashboardItems={selectedDashboardItems} />}
        </Container>
      </Wrapper>
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
