import React from 'react';
import styled from 'styled-components';
import { ViewConfig, ViewReport } from '@tupaia/types';
import { Typography } from '@material-ui/core';

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.625rem;
  height: 16rem;
`;

const Thumbnail = styled.div<{
  thumbCount: number;
  src?: string;
}>`
  height: ${({ thumbCount }) => {
    if (thumbCount === 1) return '100%';
    if (thumbCount === 2) return '12rem';
    return '50%';
  }};
  max-height: ${({ thumbCount }) => {
    if (thumbCount <= 2) return '100%';
    return '7.5rem';
  }};
  background-image: url(${({ src }) => src});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  width: ${({ thumbCount }) => {
    if (thumbCount === 1) return '100%';
    return 'min(48%, 11rem)';
  }};
  border-radius: 3px;
  background-color: ${({ theme }) => theme.palette.background.paper};
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Image = styled.img`
  width: 48%;
  height: auto;
  border: 1px solid #000;
  background-image: url(${({ src }) => src});
  background-size: cover;
  background-repeat: no-repeat;
  margin-bottom: 0.625rem;

  &:nth-child(n) {
    margin-right: 1%;
  }
  &:nth-child(2n) {
    margin-left: 1%;
  }
`;

const MoreImagesText = styled(Typography)`
  font-size: 1.125rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
`;

interface MultiPhotographPreviewProps {
  report: ViewReport;
  config: ViewConfig;
  isExport?: boolean;
}

export const MultiPhotographPreview = ({
  report: { data = [] },
  config,
  isExport,
}: MultiPhotographPreviewProps) => {
  if (isExport) {
    const thumbnails = data.map(({ value }) => value);
    return (
      <div>
        {thumbnails.map((thumbnail, i) => (
          <Image
            src={thumbnail}
            key={thumbnail}
            aria-label={`Thumbnail ${i + 1} for visualisation ${config?.name}`}
          />
        ))}
      </div>
    );
  }

  const maxThumbnailsToDisplay = 3;
  const thumbnails = data.slice(0, maxThumbnailsToDisplay).map(({ value }) => value);

  const remainingThumbnails = data.length - maxThumbnailsToDisplay;

  return (
    <Wrapper>
      {thumbnails.map((thumbnail, i) => (
        <Thumbnail
          src={thumbnail}
          key={`${thumbnail}-${i}`}
          aria-label={`Thumbnail ${i + 1} for visualisation ${config?.name}`}
          thumbCount={thumbnails.length}
        />
      ))}
      {remainingThumbnails > 0 && (
        <Thumbnail thumbCount={thumbnails.length}>
          <MoreImagesText>+ {remainingThumbnails}</MoreImagesText>
        </Thumbnail>
      )}
    </Wrapper>
  );
};
