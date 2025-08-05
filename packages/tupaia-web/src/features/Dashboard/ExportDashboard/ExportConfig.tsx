import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router';
import { Button, LoadingContainer } from '@tupaia/ui-components';
import { useEntity, useProject } from '../../../api/queries';
import { useExportDashboard } from '../../../api/mutations';
import { DashboardItemVizTypes, MOBILE_BREAKPOINT } from '../../../constants';
import {
  DisplayFormatSettings,
  DisplayOptionsSettings,
  useExportSettings,
} from '../../ExportSettings';
import { useDashboard } from '../utils';
import { ExportSubtitle } from './ExportSubtitle';
import { MailingListSection } from './MailingListSection';
import { Preview } from './Preview';
import { ExportDescriptionInput } from '../../ExportSettings/ExportDescriptionInput';

const ButtonGroup = styled.div`
  padding: 1rem 0;
  width: 100%;
  display: flex;
  justify-content: flex-end;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
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
  margin-block-end: 2rem;

  @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
    width: 62%;
    margin-inline-end: 2rem;
    margin-block-end: 0;
  }
`;

const ExportSetting = styled.div`
  border: ${({ theme }) => theme.palette.text.secondary};
  border-width: 0.1rem;
  border-style: solid;
  border-radius: 7px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 1rem;

  .MuiFormGroup-root {
    align-content: start;
  }

  .MuiFormControlLabel-root {
    margin-inline-start: -0.5rem;
  }
  .MuiFormControlLabel-label {
    font-size: 0.875rem;
  }
  .MuiSvgIcon-root {
    font-size: 1.2rem;
  }

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

const ExportSettingsWrapper = styled.div`
  padding-block-end: 0.8rem;
  & + & {
    padding-block-start: 1rem;
    border-top: 0.1rem solid ${({ theme }) => theme.palette.text.secondary};
  }
  &:last-child {
    padding-block-end: 0;
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
  const { exportWithLabels, exportWithTable, exportDescription, separatePagePerItem } =
    useExportSettings();

  const exportFileName = `${project?.name}-${entity?.name}-${dashboardName}-dashboard-export`;

  const { mutate: requestPdfExport, error, isLoading, reset } = useExportDashboard(exportFileName);

  const handleExport = () =>
    requestPdfExport({
      projectCode,
      entityCode,
      dashboardCode: activeDashboard?.code,
      selectedDashboardItems,
      settings: {
        exportWithLabels,
        exportWithTable,
        exportDescription,
        separatePagePerItem,
      },
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
              <ExportSubtitle>Edit export settings and click ‘Download’.</ExportSubtitle>
            </ExportSettingsInstructionsContainer>
            <ExportSetting>
              <section>
                <ExportSettingsWrapper>
                  <ExportDescriptionInput />
                </ExportSettingsWrapper>
                <ExportSettingsWrapper>
                  <DisplayFormatSettings />
                </ExportSettingsWrapper>
                {hasChartItems && (
                  <ExportSettingsWrapper>
                    <DisplayOptionsSettings />
                  </ExportSettingsWrapper>
                )}
              </section>
              <MailingListSection
                selectedDashboardItems={selectedDashboardItems}
                settings={{
                  exportWithTable,
                  exportWithLabels,
                  exportDescription,
                  separatePagePerItem,
                }}
              />
            </ExportSetting>
          </ExportSettingsContainer>
          {!isLoading && (
            <Preview
              selectedDashboardItems={selectedDashboardItems}
              separatePagePerItem={separatePagePerItem}
            />
          )}
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
