/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { ViewConfig, ViewReport } from '@tupaia/types';
import { MultiPhotographPreview } from './MultiPhotographPreview';
import { MultiPhotographEnlarged } from './MultiPhotographEnlarged';

interface MultiPhotographProps {
  report: ViewReport;
  config: ViewConfig;
  isEnlarged?: boolean;
}

export const MultiPhotograph = ({ report, config, isEnlarged }: MultiPhotographProps) => {
  if (!isEnlarged) return <MultiPhotographPreview report={report} config={config} />;
  return <MultiPhotographEnlarged report={report} config={config} />;
};
