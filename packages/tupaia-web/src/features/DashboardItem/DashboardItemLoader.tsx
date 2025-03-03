import React from 'react';
import styled from 'styled-components';
import { SpinningLoader } from '@tupaia/ui-components';
import { DashboardItemConfig } from '@tupaia/types';

const LoadingContainer = styled.div<{
  $isExporting?: boolean;
}>`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  margin-top: ${({ $isExporting }) => ($isExporting ? '1rem' : '0')};
`;

interface DashboardItemLoaderProps {
  name?: DashboardItemConfig['name'];
  isExport?: boolean;
}
/**
 * DashboardItemLoader handles displaying of the loader within a dashboard item
 */
export const DashboardItemLoader = ({ name, isExport }: DashboardItemLoaderProps) => {
  return (
    <LoadingContainer aria-label={`Loading data for report '${name}'`} $isExporting={isExport}>
      <SpinningLoader />
    </LoadingContainer>
  );
};
