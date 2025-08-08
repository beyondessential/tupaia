import React, { useContext, useRef } from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { Button as BaseButton, SpinningLoader } from '@tupaia/ui-components';
import { ViewVizTypes } from '../../constants';
import { Entity } from '../../types';
import { DisplayOptionsSettings, ExportFormatSettings, ExportFormats } from '../ExportSettings';
import {
  ExportDashboardItemContext,
  useEnlargedDashboardItem,
  useExportDashboardItem,
} from './utils';
import { ExportPreview } from './ExportPreview';

const Wrapper = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  fieldset {
    margin-top: 1.5rem;
  }
`;

const ExportContentContainer = styled.div`
  flex-grow: 1;
  text-align: left;
  margin-bottom: 1rem;
  min-width: 40rem; // so that when the loader shows things don't shrink too much
  ${({ theme }) => theme.breakpoints.up('sm')} {
    display: grid;
    grid-template-columns: 3fr 7fr;
    grid-gap: 1rem;
  }
`;

const Title = styled(Typography).attrs({
  variant: 'h2',
})`
  font-size: 1.25rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  text-align: center;
  margin: 0.3rem 0 0.8rem 0;
  line-height: 1.4;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const Button = styled(BaseButton)`
  text-transform: none;
`;

export const ExportDashboardItem = ({ entityName }: { entityName?: Entity['name'] }) => {
  const exportRef = useRef<HTMLDivElement | null>(null);
  const { currentDashboardItem } = useEnlargedDashboardItem();
  const { isExportMode, isExporting, exportError } = useContext(ExportDashboardItemContext);
  const { handleExport, cancelExport } = useExportDashboardItem(entityName, exportRef);
  if (!isExportMode) return null;
  const exportOptions = [
    {
      label: 'PNG',
      value: ExportFormats.PNG,
    },
    {
      label: 'Excel (raw data)',
      value: ExportFormats.XLSX,
    },
  ];

  const isChart = currentDashboardItem?.config?.type === 'chart';

  // PNG export is not available for matrix reports
  const getHasPNGExportOption = () => {
    if (!currentDashboardItem?.config) return false;
    const { type } = currentDashboardItem?.config;
    if (isChart) {
      return true;
    }
    if (type === 'view') {
      const { viewType } = currentDashboardItem?.config;
      return viewType === ViewVizTypes.MultiValue;
    }
    return false;
  };

  const hasPNGExportOption = getHasPNGExportOption();

  const availableExportOptions = hasPNGExportOption
    ? exportOptions
    : exportOptions.filter(option => option.value !== ExportFormats.PNG);

  return (
    <Wrapper>
      <Title>Export this chart</Title>
      <ExportContentContainer>
        <div>
          {isExporting ? (
            <SpinningLoader />
          ) : (
            <form>
              <Typography>The chart will be exported and downloaded to your browser.</Typography>
              <ExportFormatSettings exportFormatOptions={availableExportOptions} />
              {isChart && <DisplayOptionsSettings />}
            </form>
          )}
          {exportError && <Typography color="error">{exportError}</Typography>}
        </div>
        <div>
          <ExportPreview entityName={entityName} exportRef={exportRef} />
        </div>
      </ExportContentContainer>
      <ButtonWrapper>
        <Button onClick={cancelExport} variant="outlined" color="default" disabled={isExporting}>
          Cancel
        </Button>
        <Button color="primary" onClick={handleExport} disabled={isExporting}>
          Export chart
        </Button>
      </ButtonWrapper>
    </Wrapper>
  );
};
