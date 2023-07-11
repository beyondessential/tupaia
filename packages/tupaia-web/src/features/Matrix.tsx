/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { getIsUsingDots } from '@tupaia/ui-components';
import { DashboardItemDisplayProps, MatrixViewContent } from '../types';
import { ConditionalPresentationOptions } from '@tupaia/types';

export const Matrix = ({
  viewContent,
  isEnlarged = false,
}: Pick<DashboardItemDisplayProps, 'isEnlarged'> & {
  viewContent: MatrixViewContent;
}) => {
  const getPlaceholderImage = () => {
    const { presentationOptions = {}, categoryPresentationOptions = {} } = viewContent;
    if (!getIsUsingDots(presentationOptions) && !getIsUsingDots(categoryPresentationOptions))
      return '/images/matrix-placeholder-text-only.png';
    if ((presentationOptions as ConditionalPresentationOptions)?.applyLocation?.columnIndexes)
      return '/images/matrix-placeholder-mix.png';
    return '/images/matrix-placeholder-dot-only.png';
  };
  if (!isEnlarged) return <img src={getPlaceholderImage()} alt="Matrix Placeholder" />;
  console.log(viewContent);
  return <></>;
};
