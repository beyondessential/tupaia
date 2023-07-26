/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { ChangeEvent, useContext, useRef } from 'react';
import styled from 'styled-components';
import { CircularProgress, FormGroup, Typography } from '@material-ui/core';
import {
  Button as BaseButton,
  RadioGroup as BaseRadioGroup,
  Checkbox as BaseCheckbox,
} from '@tupaia/ui-components';
import {
  ACTION_TYPES,
  EXPORT_FORMATS,
  ExportContext,
  ExportDispatchContext,
  useEnlargedDashboardItem,
  useExportDashboardItem,
} from './utils';
import { Entity } from '../../types';
import { EnlargedDashboardVisual } from './EnlargedDashboardVisual';

const Wrapper = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Container = styled.div`
  flex-grow: 1;
  display: flex;
`;

const LoadingContainer = styled(Container)`
  justify-content: center;
  align-items: center;
`;

const ExportContentContainer = styled(Container)`
  flex-grow: 1;
  display: flex;
`;

const LeftColumn = styled.div`
  width: 30%;
  text-align: left;
`;

const Title = styled(Typography).attrs({
  variant: 'h2',
})`
  font-size: 1.25rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  text-align: center;
  margin: 0.3rem 0 1rem 0;
  line-height: 1.4;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const Button = styled(BaseButton)`
  text-transform: none;
`;

const RadioGroup = styled(BaseRadioGroup)`
  margin-top: 1rem;
  .MuiFormGroup-root {
    border: none;
    margin-top: 0.5rem;
    flex-direction: column;
  }
  legend {
    color: ${({ theme }) => theme.palette.text.primary};
    font-size: 1rem;
    font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  }
  label {
    background: transparent;
    border: none;
    padding-top: 0;
  }
  .MuiSvgIcon-root {
    width: 1.5rem;
    height: 1.5rem;
  }
`;

const Legend = styled.legend`
  color: ${({ theme }) => theme.palette.text.primary};
  font-size: 1rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
`;

const Checkbox = styled(BaseCheckbox)`
  margin: 0.5rem 0 0 1rem;
  .MuiButtonBase-root {
    padding: 0;
    margin-right: 0.5rem;
  }
  label {
    padding: 0.5rem 0 0 0.5rem;
  }
`;

const RightColumn = styled.div`
  flex-grow: 1;
  width: 70%;
  padding-left: 2rem;
  padding-bottom: 2rem;
`;

const ScrollableContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 25rem;
  overflow-y: auto;
  background: white;
`;
const PreviewWrapper = styled.div<{
  $isPNG: boolean;
}>`
  height: 100%;
  margin: 1rem 0;
  display: flex;
  justify-content: center;
  align-items: center;
  zoom: ${({ $isPNG }) => ($isPNG ? 0.5 : 1)};
`;

const PreviewContainer = styled.div`
  width: 50rem; // the size of the a4 page
  padding: 1rem;
  height: 100%;
  h2 {
    color: ${({ theme }) => theme.palette.common.black};
  }
`;

const PreviewTitle = styled(Typography).attrs({
  variant: 'h3',
})`
  font-size: 1rem;
  text-align: left;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  margin-bottom: 1rem;
`;

const NoPreviewMessage = styled(Typography)`
  color: ${({ theme }) => theme.palette.common.black};
`;

export const ExportDashboardItem = ({ entityName }: { entityName?: Entity['name'] }) => {
  const {
    isExportMode,
    isExporting,
    exportFormat,
    exportWithLabels,
    exportWithTable,
    exportWithTableDisabled,
    exportError,
  } = useContext(ExportContext);
  const dispatch = useContext(ExportDispatchContext)!;
  const exportRef = useRef<HTMLDivElement | null>(null);
  const { activeDashboard, currentDashboardItem, reportData } = useEnlargedDashboardItem();
  const handleStartExport = useExportDashboardItem(
    activeDashboard,
    currentDashboardItem,
    reportData,
    entityName,
    exportRef,
  );
  if (!isExportMode) return null;
  const cancelExport = () => {
    dispatch({
      type: ACTION_TYPES.SET_IS_EXPORT_MODE,
      payload: false,
    });
  };
  const setExportFormat = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: ACTION_TYPES.SET_EXPORT_FORMAT,
      payload: e.target.value,
    });
  };

  const setExportWithLabels = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: ACTION_TYPES.SET_EXPORT_WITH_LABELS,
      payload: e.target.checked,
    });
  };

  const setExportWithTable = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: ACTION_TYPES.SET_EXPORT_WITH_TABLE,
      payload: e.target.checked,
    });
  };

  const exportOptions = [
    {
      label: 'PNG',
      value: EXPORT_FORMATS.PNG,
    },
    {
      label: 'Excel (raw data)',
      value: EXPORT_FORMATS.XLSX,
    },
  ];
  const { type } = currentDashboardItem?.config ?? {};
  // PNG export is not available for matrix reports
  const availableExportOptions =
    type === 'chart'
      ? exportOptions
      : exportOptions.filter(option => option.value !== EXPORT_FORMATS.PNG);

  return (
    <Wrapper>
      <Title>Export this chart</Title>
      <ExportContentContainer>
        <LeftColumn>
          {isExporting ? (
            <LoadingContainer>
              <CircularProgress />
            </LoadingContainer>
          ) : (
            <>
              <Typography>The chart will be exported and downloaded to your browser.</Typography>
              <RadioGroup
                options={availableExportOptions}
                value={exportFormat}
                onChange={setExportFormat}
                name="exportFormat"
                label="Export format"
              />
              {exportFormat === EXPORT_FORMATS.PNG && (
                <FormGroup>
                  <Legend>Display options</Legend>
                  <Checkbox
                    label="Export with Labels"
                    value={true}
                    name="displayOptions"
                    color="primary"
                    checked={exportWithLabels}
                    onChange={setExportWithLabels}
                  />
                  {!exportWithTableDisabled && (
                    <Checkbox
                      label="Export with Table"
                      value={true}
                      name="displayOptions"
                      color="primary"
                      checked={exportWithTable}
                      onChange={setExportWithTable}
                    />
                  )}
                </FormGroup>
              )}
            </>
          )}
          {exportError && <Typography color="error">{exportError}</Typography>}
        </LeftColumn>
        <RightColumn>
          <PreviewTitle>Preview</PreviewTitle>
          <ScrollableContent>
            <PreviewWrapper $isPNG={exportFormat === EXPORT_FORMATS.PNG}>
              {exportFormat === EXPORT_FORMATS.PNG ? (
                <PreviewContainer ref={exportRef}>
                  <EnlargedDashboardVisual entityName={entityName} isPreview />
                </PreviewContainer>
              ) : (
                <NoPreviewMessage>No preview available</NoPreviewMessage>
              )}
            </PreviewWrapper>
          </ScrollableContent>
        </RightColumn>
      </ExportContentContainer>
      <ButtonWrapper>
        <Button onClick={cancelExport} variant="outlined" color="default" disabled={isExporting}>
          Cancel
        </Button>
        <Button color="primary" onClick={handleStartExport} disabled={isExporting}>
          Export chart
        </Button>
      </ButtonWrapper>
    </Wrapper>
  );
};
