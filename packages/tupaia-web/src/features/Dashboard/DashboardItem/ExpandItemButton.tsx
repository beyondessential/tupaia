/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import MuiZoomIcon from '@material-ui/icons/ZoomIn';
import { useSearchParams } from 'react-router-dom';
import { DashboardItemType } from '../../../types';

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

interface ExpandItemButtonProps {
  reportCode: DashboardItemType['reportCode'];
  viewType: DashboardItemType['viewType'];
}

export const ExpandItemButton = ({ reportCode, viewType }: ExpandItemButtonProps) => {
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const handleExpandDashboardItem = () => {
    urlSearchParams.set('report', String(reportCode));
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
