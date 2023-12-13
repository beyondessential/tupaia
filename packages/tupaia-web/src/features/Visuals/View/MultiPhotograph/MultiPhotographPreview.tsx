/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { ViewConfig, ViewReport } from '@tupaia/types';

const MAX_THUMBNAILS = 3;

const Wrapper = styled.div`
  display: flex;
  height: 16rem;
`;

const Thumbnail = styled.div<{
  thumbCount: number;
  src: string;
}>`
  max-height: 100%;
  background-image: url(${({ src }) => src});
  background-size: cover;
  background-repeat: no-repeat;
  width: ${({ thumbCount }) => {
    if (thumbCount === 1) return '100%';
    if (thumbCount === 2) return '50%';
    return '25%';
  }};
  &:nth-child(2) {
    width: 50%;
  }
`;

interface MultiPhotographPreviewProps {
  report: ViewReport;
  config: ViewConfig;
}

export const MultiPhotographPreview = ({
  report: { data = [] },
  config,
}: MultiPhotographPreviewProps) => {
  const thumbnails = data.slice(0, MAX_THUMBNAILS).map(({ value }) => value);
  return (
    <Wrapper>
      {thumbnails.map((thumbnail, i) => (
        <Thumbnail
          src={thumbnail}
          key={thumbnail}
          aria-label={`Thumbnail ${i + 1} for visualisation ${config?.name}`}
          thumbCount={thumbnails.length}
        />
      ))}
    </Wrapper>
  );
};
