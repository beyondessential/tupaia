/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useContext } from 'react';
import styled from 'styled-components';
import MuiZoomIcon from '@material-ui/icons/ZoomIn';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@tupaia/ui-components';
import { MOBILE_BREAKPOINT, URL_SEARCH_PARAMS } from '../../constants';
import { DashboardItemConfig, ViewReport } from '../../types';
import { DashboardItemContext } from './DashboardItemContext';

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
    width: 3rem;
    height: 3rem;
    margin-right: 0;
  }
`;

const EXPANDABLE_TYPES = ['chart', 'matrix', 'dataDownload', 'filesDownload'];

/**
 * ExpandItemButton handles the 'expand' button for the dashboard item in both mobile and desktop sizes
 */
export const ExpandItemButton = () => {
  const { config, isEnlarged, isExport, report, reportCode } = useContext(DashboardItemContext);

  const { viewType, type, periodGranularity } = config || ({} as DashboardItemConfig);
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();

  if (isEnlarged || isExport) return null;

  const getIsExpandable = () => {
    if (periodGranularity) return true;
    else if (EXPANDABLE_TYPES.includes(type)) return true;
    else if (viewType && EXPANDABLE_TYPES.includes(viewType)) return true;
    else if (viewType === 'qrCodeVisual') {
      const { data } = report as ViewReport;
      return data && data.length > 1;
    }
    return false;
  };

  if (!getIsExpandable()) return null;

  const getText = () => {
    if (viewType === 'dataDownload' || viewType === 'qrCodeVisual')
      return 'Expand to download data';
    return 'Expand chart';
  };

  const handleExpandDashboardItem = () => {
    urlSearchParams.set(URL_SEARCH_PARAMS.REPORT, String(reportCode));
    setUrlSearchParams(urlSearchParams.toString());
  };

  const text = getText();

  return (
    <ExpandableButton onClick={handleExpandDashboardItem}>
      <ZoomInIcon />
      <ExpandButtonText>{text}</ExpandButtonText>
    </ExpandableButton>
  );
};
