import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { ExportFormats, useExportSettings } from '../ExportSettings';
import { EnlargedDashboardVisual } from '.';

const ScrollableContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 25rem;
  overflow: auto;
  background: white;
`;
const PreviewWrapper = styled.div<{
  $isPNG: boolean;
}>`
  height: 100%;
  margin: 1rem 0;
  display: ${({ $isPNG }) => ($isPNG ? 'block' : 'flex')};
  justify-content: center;
  align-items: center;
  zoom: ${({ $isPNG }) => ($isPNG ? 0.5 : 1)};
`;

const PreviewContainer = styled.div`
  min-width: 50rem; // the size of the a4 page
  width: 100%;
  padding: 1rem;
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
  ${({ theme }) => theme.breakpoints.down('sm')} {
    margin-top: 1rem;
  }
`;

const NoPreviewMessage = styled(Typography)`
  color: ${({ theme }) => theme.palette.background.paper};
`;

export const ExportPreview = ({ entityName, exportRef }) => {
  const { exportFormat } = useExportSettings();
  return (
    <>
      <PreviewTitle>Preview</PreviewTitle>
      <ScrollableContent>
        <PreviewWrapper $isPNG={exportFormat === ExportFormats.PNG}>
          {exportFormat === ExportFormats.PNG ? (
            <PreviewContainer ref={exportRef}>
              <EnlargedDashboardVisual entityName={entityName} isPreview />
            </PreviewContainer>
          ) : (
            <NoPreviewMessage>No preview available</NoPreviewMessage>
          )}
        </PreviewWrapper>
      </ScrollableContent>
    </>
  );
};
