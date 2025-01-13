import React, { useContext } from 'react';
import styled from 'styled-components';
import MuiZoomIcon from '@material-ui/icons/ZoomIn';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@tupaia/ui-components';
import { ViewReport } from '@tupaia/types';
import {
  DashboardItemVizTypes,
  MOBILE_BREAKPOINT,
  URL_SEARCH_PARAMS,
  ViewVizTypes,
} from '../../constants';
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

const EXPANDABLE_TYPES = [
  DashboardItemVizTypes.Chart,
  ViewVizTypes.DataDownload,
  ViewVizTypes.FilesDownload,
  ViewVizTypes.MultiValue,
];

/**
 * ExpandItemButton handles the 'expand' button for the dashboard item in both mobile and desktop sizes
 */
export const ExpandItemButton = () => {
  const { config, isEnlarged, isExport, report, reportCode } = useContext(DashboardItemContext);

  const { type, periodGranularity } = config || {};
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();

  if (isEnlarged || isExport) return null;

  const viewType = config?.type === 'view' ? config.viewType : undefined;

  const getIsExpandable = () => {
    if (periodGranularity) return true;
    // always allow matrix to be expanded
    if (type === DashboardItemVizTypes.Matrix) return true;

    const comparisonType = viewType || type;
    // only expand expandable types if they have data, if they don't have periodGranularity set
    if (comparisonType && EXPANDABLE_TYPES.includes(comparisonType)) {
      const { data } = report as ViewReport;
      return data && data.length > 0;
    } else if (comparisonType === ViewVizTypes.QRCode) {
      const { data } = report as ViewReport;
      return data && data.length > 1;
    }
    return false;
  };

  if (!getIsExpandable()) return null;

  const getText = () => {
    if (viewType && [ViewVizTypes.DataDownload, ViewVizTypes.FilesDownload].includes(viewType))
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
