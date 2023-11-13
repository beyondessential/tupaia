/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useContext } from 'react';
import styled from 'styled-components';
import MuiZoomIcon from '@material-ui/icons/ZoomIn';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@tupaia/ui-components';
import { ViewReport } from '@tupaia/types';
import { MOBILE_BREAKPOINT, URL_SEARCH_PARAMS } from '../../constants';
import { DashboardItemConfig } from '../../types';
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
    border: none;
    top: 0;
    left: 0;
    opacity: 0;
    margin-top: 0;
    &:hover,
    &:focus-visible {
      background-color: rgba(32, 33, 36, 0.6);
      opacity: 1;
    }
  }
`;

const ExpandButtonText = styled.span`
  font-size: 1rem;
`;

const ZoomInIcon = styled(MuiZoomIcon)`
  @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
    width: 1.5rem;
    height: 1.5rem;
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
    if (!periodGranularity) return false;
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
    <ExpandableButton onClick={handleExpandDashboardItem} startIcon={<ZoomInIcon />}>
      <ExpandButtonText>{text}</ExpandButtonText>
    </ExpandableButton>
  );
};
