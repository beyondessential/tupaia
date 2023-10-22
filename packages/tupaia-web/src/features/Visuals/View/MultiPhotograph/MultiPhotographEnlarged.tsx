/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import { ViewConfig, ViewReport } from '@tupaia/types';
import { MultiPhotographPreview } from './MultiPhotographPreview';
import { ZoomIn as MuiZoomIn } from '@material-ui/icons';
import { Carousel } from './Carousel';

const Wrapper = styled.div`
  position: relative;
`;

const ExpandButton = styled.button`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  border: none;
  width: 100%;
  height: 100%;
  opacity: 0;
  background-color: rgba(32, 33, 36, 0.6);
  color: ${({ theme }) => theme.palette.common.white};
  &:hover,
  &:focus-visible {
    opacity: 1;
  }
`;

const ZoomIn = styled(MuiZoomIn)`
  width: 4rem;
  height: 4rem;
`;

interface MultiPhotographEnlargedProps {
  report: ViewReport;
  config: ViewConfig;
}

export const MultiPhotographEnlarged = ({ report, config }: MultiPhotographEnlargedProps) => {
  const [carouselOpen, setCarouselOpen] = useState(false);
  return (
    <Wrapper>
      <MultiPhotographPreview report={report} config={config} />
      <ExpandButton onClick={() => setCarouselOpen(true)}>
        <ZoomIn />
      </ExpandButton>
      {carouselOpen && <Carousel report={report} onClose={() => setCarouselOpen(false)} />}
    </Wrapper>
  );
};
