/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { ReferenceLine } from 'recharts';
import { formatDataValueByType } from '@tupaia/utils';
import { ChartConfigObject, ChartType } from '@tupaia/types';
import { TUPAIA_ORANGE } from '../../constants';
import { CartesianChartViewContent, ViewContent } from '../../types';
import { ReferenceLabel } from './ReferenceLabel';

const ReferenceLineLabel = ({
  referenceLineLabel,
  isExporting,
}: {
  referenceLineLabel?: string;
  isExporting?: boolean;
}) => {
  if (referenceLineLabel === undefined) return undefined;
  return <ReferenceLabel value={referenceLineLabel} fill={isExporting ? '#000000' : '#ffffff'} />;
};

enum Y_AXIS_IDS {
  left = 0,
  right = 1,
}

const DEFAULT_Y_AXIS = {
  id: Y_AXIS_IDS.left,
  orientation: 'left',
  yAxisDomain: {
    min: { type: 'number', value: 0 },
    max: { type: 'string', value: 'auto' },
  },
};

const orientationToYAxisId = (orientation?: 'left' | 'right'): number =>
  (orientation && Y_AXIS_IDS[orientation]) || DEFAULT_Y_AXIS.id;

function hasReferenceValue(chartConfig?: ChartConfigObject) {
  return chartConfig && chartConfig?.referenceValue !== undefined;
}

const ValueReferenceLine = ({
  viewContent,
  isExporting,
}: {
  viewContent: CartesianChartViewContent;
  isExporting?: boolean;
}) => {
  const { chartConfig } = viewContent;

  if (!chartConfig || !hasReferenceValue(chartConfig)) {
    return [];
  }

  const referenceLines = Object.entries(chartConfig)
    .filter(([, { referenceValue }]) => referenceValue)
    .map(([dataKey, { referenceValue, yAxisOrientation, referenceLabel }]) => ({
      key: `reference_line_${dataKey}`, // Use prefix to distinguish from curve key
      y: referenceValue,
      yAxisId: orientationToYAxisId(yAxisOrientation),
      referenceLineLabel: referenceLabel,
    }));

  return referenceLines.map(referenceLine => (
    <ReferenceLine
      key={referenceLine.key}
      y={referenceLine.y}
      yAxisId={referenceLine.yAxisId}
      stroke={isExporting ? '#000000' : '#ffffff'}
      strokeDasharray="3 3"
      label={ReferenceLineLabel({
        referenceLineLabel: referenceLine.referenceLineLabel,
        isExporting,
      })}
    />
  ));
};

interface ReferenceLineProps {
  viewContent: CartesianChartViewContent;
  isExporting?: boolean;
  isEnlarged?: boolean;
}

const AverageReferenceLine = ({ viewContent }: ReferenceLineProps) => {
  const { valueType, data } = viewContent;
  const presentationOptions =
    'presentationOptions' in viewContent && viewContent.presentationOptions;
  // show reference line by default
  const shouldHideReferenceLine = presentationOptions && presentationOptions.hideAverage;
  // average is null for stacked charts that don't have a "value" key in data
  const average = data.reduce((acc: number, row) => acc + (row.value as number), 0) / data.length;

  if (!average || shouldHideReferenceLine) {
    return null;
  }
  return (
    <ReferenceLine
      y={average}
      stroke={TUPAIA_ORANGE}
      label={
        <ReferenceLabel
          value={`Average ${formatDataValueByType({ value: average }, valueType)}`}
          fill={TUPAIA_ORANGE}
        />
      }
    />
  );
};

const BarReferenceLine = ({ viewContent, isExporting, isEnlarged }: ReferenceLineProps) => {
  if (
    viewContent?.presentationOptions &&
    'referenceLines' in viewContent.presentationOptions &&
    viewContent?.presentationOptions.referenceLines
  ) {
    return ValueReferenceLine({
      viewContent,
      isExporting,
    });
  }
  return AverageReferenceLine({ viewContent, isExporting, isEnlarged });
};

export const ReferenceLines = ({ viewContent, isExporting, isEnlarged }: ReferenceLineProps) => {
  if (viewContent.chartType === ChartType.Bar) {
    return BarReferenceLine({ viewContent, isExporting, isEnlarged });
  }
  return ValueReferenceLine({ viewContent, isExporting });
};
