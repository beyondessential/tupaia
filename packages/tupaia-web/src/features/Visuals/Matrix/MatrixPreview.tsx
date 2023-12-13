/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { DashboardItemConfig } from '../../../types';
import { ConditionalPresentationOptions, MatrixConfig } from '@tupaia/types';
import { getIsUsingDots } from '@tupaia/ui-components';
import styled from 'styled-components';

const PlaceholderWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PlaceholderImage = styled.img`
  max-width: 100%;
`;
const getPlaceholderImage = ({
  presentationOptions = {},
  categoryPresentationOptions = {},
}: MatrixConfig) => {
  // if the matrix is not using any dots, show a text-only placeholder
  if (!getIsUsingDots(presentationOptions) && !getIsUsingDots(categoryPresentationOptions))
    return '/images/matrix-placeholder-text-only.png';
  // if the matrix has applyLocation.columnIndexes, show a mix placeholder, because this means it is a mix of dots and text
  if ((presentationOptions as ConditionalPresentationOptions)?.applyLocation?.columnIndexes)
    return '/images/matrix-placeholder-mix.png';
  // otherwise, show a dot-only placeholder
  return '/images/matrix-placeholder-dot-only.png';
};

export const MatrixPreview = ({ config }: { config?: DashboardItemConfig | null }) => {
  const placeholderImage = getPlaceholderImage(config as MatrixConfig);
  return (
    <PlaceholderWrapper>
      <PlaceholderImage src={placeholderImage} alt="Matrix Placeholder" />
    </PlaceholderWrapper>
  );
};
