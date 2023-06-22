/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import { Typography, CircularProgress } from '@material-ui/core';
import MuiZoomIcon from '@material-ui/icons/ZoomIn';
import { useParams } from 'react-router';
import { DashboardItemType } from '../types';
import { useReport } from '../api/queries';
import { Chart } from './Chart';

const Wrapper = styled.div`
  display: flex;
  align-items: stretch;
  place-content: stretch center;
  margin-bottom: 0.5rem;
  width: 100%;
  max-width: 100%;
  position: relative;
  background-color: ${({ theme }) => theme.palette.background.default};
`;

const Container = styled.div`
  flex-flow: column nowrap;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: stretch;
  padding: 1rem 1rem 0.6rem;
`;

const Title = styled(Typography).attrs({
  variant: 'h3',
})`
  font-size: 1rem;
  text-align: center;
  margin: 0.3rem 0 1rem 0;
  line-height: 1.4;
`;

const LoadingContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1rem;
`;

const ExpandableButton = styled.button`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.palette.common.black}};
  border: none;
  top: 0;
  left:0;
  z-index: 1;
  opacity: 0;
  cursor: pointer;
  color: ${({ theme }) => theme.palette.common.white};
  &:hover,
  &:focus-visible {
    opacity: 0.7;
  }
`;

const ExpandButtonText = styled.span`
  font-size: 1rem;
`;

const ZoomInIcon = styled(MuiZoomIcon)`
  width: 4rem;
  height: 4rem;
`;

const testDashboardItem = {
  code: '28',
  legacy: true,
  reportCode: '28',
  name: 'Number of Operational Facilities Surveyed by Country',
  type: 'chart',
  chartType: 'pie',
  valueType: 'text',
  isFavourite: null,
  rootEntityCode: 'DL',
  id: '28',
  viewType: '',
  periodGranularity: null,
};

export const DashboardItem = ({ dashboardItem }: { dashboardItem: DashboardItemType }) => {
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const { projectCode, entityCode, '*': dashboardCode } = useParams();
  const { type, name, legacy, code, reportCode } = testDashboardItem;
  const isLoading = true;
  const {
    data: reportData,
    // isLoading
  } = useReport(projectCode, entityCode, dashboardCode, reportCode, code, legacy);

  const viewContent = {
    ...testDashboardItem,
    ...reportData,
  };

  const { periodGranularity, viewType } = viewContent;

  const isExpandable =
    periodGranularity || type === 'chart' || type === 'matrix' || viewType === 'dataDownload';

  const handleExpandDashboardItem = () => {
    urlSearchParams.set('report', reportCode);
    setUrlSearchParams(urlSearchParams.toString());
  };
  return (
    <Wrapper>
      {isLoading ? (
        <LoadingContainer aria-label={`Loading data for report '${name}'`}>
          <CircularProgress />
        </LoadingContainer>
      ) : (
        <Container>
          {isExpandable && (
            <ExpandableButton onClick={handleExpandDashboardItem}>
              <ZoomInIcon />
              <ExpandButtonText>
                {viewType === 'dataDownload' ? 'Expand to download data' : 'Expand chart'}
              </ExpandButtonText>
            </ExpandableButton>
          )}
          {name && <Title>{name}</Title>}
          {type === 'chart' ? <Chart viewContent={viewContent} /> : null}
        </Container>
      )}
    </Wrapper>
  );
};
