import React from 'react';
import { ViewConfig, ViewReport } from '@tupaia/types';
import { MultiPhotographPreview } from './MultiPhotographPreview';
import { MultiPhotographEnlarged } from './MultiPhotographEnlarged';

interface MultiPhotographProps {
  report: ViewReport;
  config: ViewConfig;
  isEnlarged?: boolean;
  isExport?: boolean;
}

export const MultiPhotograph = ({ report, config, isEnlarged, isExport }: MultiPhotographProps) => {
  if (!isEnlarged || isExport) {
    return <MultiPhotographPreview report={report} config={config} isExport={isExport} />;
  }
  return <MultiPhotographEnlarged report={report} config={config} />;
};
