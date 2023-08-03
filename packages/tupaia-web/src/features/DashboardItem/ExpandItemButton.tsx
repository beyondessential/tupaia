/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import MuiZoomIcon from '@material-ui/icons/ZoomIn';
import { useSearchParams } from 'react-router-dom';
import { ViewConfig } from '@tupaia/types';
import { Button } from '@tupaia/ui-components';
import { MOBILE_BREAKPOINT, URL_SEARCH_PARAMS } from '../../constants';
import { DashboardItem } from '../../types';

const ExpandableButton = styled(Button).attrs({
  variant: 'outlined',
  color: 'default',
})`
  text-transform: none;
  font-weight: ${({ theme }) => theme.typography.fontWeightRegular};
  cursor: pointer;
  color: ${({ theme }) => theme.palette.common.white};
  border-color: ${({ theme }) => theme.palette.common.white};
  padding: 0.3rem;
  margin-top: 1rem;
  @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
    .MuiButton-label {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: ${({ theme }) => theme.palette.common.black};
    border: none;
    top: 0;
    left: 0;
    opacity: 0;
    margin-top: 0;
    &:hover,
    &:focus-visible {
      opacity: 0.7;
      background-color: ${({ theme }) => theme.palette.common.black};
    }
  }
`;

const ExpandButtonText = styled.span`
  font-size: 1rem;
`;

const ZoomInIcon = styled(MuiZoomIcon)`
  margin-right: 1rem;
  @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
    width: 4rem;
    height: 4rem;
    margin-right: 0;
  }
`;

interface ExpandItemButtonProps {
  reportCode: DashboardItem['reportCode'];
  viewType?: ViewConfig['viewType'];
}

/**
 * ExpandItemButton handles the 'expand' button for the dashboard item in both mobile and desktop sizes
 */
export const ExpandItemButton = ({ reportCode, viewType }: ExpandItemButtonProps) => {
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const handleExpandDashboardItem = () => {
    urlSearchParams.set(URL_SEARCH_PARAMS.REPORT, String(reportCode));
    setUrlSearchParams(urlSearchParams.toString());
  };

  return (
    <ExpandableButton onClick={handleExpandDashboardItem}>
      <ZoomInIcon />
      <ExpandButtonText>
        {viewType === 'dataDownload' ? 'Expand to download data' : 'Expand chart'}
      </ExpandButtonText>
    </ExpandableButton>
  );
};
