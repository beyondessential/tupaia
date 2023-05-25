/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { ReferenceLine } from 'recharts';
import { formatDataValueByType } from '@tupaia/utils';
import { TUPAIA_ORANGE } from '../../constants';
import { BaseChartConfig, PieChartConfig } from '@tupaia/types';
import { ChartType, DataProps } from '../../types';
import { ReferenceLabel } from './ReferenceLabel';
import { ViewContent } from '../../types';

const ReferenceLineLabel = ({
  referenceLineLabel,
  isExporting,
}: {
  referenceLineLabel: string;
  isExporting?: boolean;
}) => {
  if (referenceLineLabel === undefined) return null;
  return (
    <ReferenceLabel value={`${referenceLineLabel}`} fill={isExporting ? '#000000' : '#ffffff'} />
  );
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

const orientationToYAxisId = (orientation: 'left' | 'right'): number =>
  Y_AXIS_IDS[orientation] || DEFAULT_Y_AXIS.id;

interface ChartConfig extends BaseChartConfig {
  referenceValue: string | number;
  yAxisOrientation: string | number;
  referenceLabel: string | number;
}

function isChartConfig(config: ChartConfig | {}): config is ChartConfig {
  return (config as ChartConfig).referenceValue !== undefined;
}

const ValueReferenceLine = ({
  viewContent,
  isExporting,
}: {
  viewContent: { chartConfig: ChartConfig };
  isExporting?: boolean;
}) => {
  const { chartConfig = {} } = viewContent;

  if (!isChartConfig(chartConfig)) {
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
      stroke={isExporting ? '#000000' : '#ffffff'}
      strokeDasharray="3 3"
      // @ts-ignore
      label={ReferenceLineLabel({
        referenceLineLabel: referenceLine.referenceLineLabel,
        isExporting,
      })}
      {...referenceLine}
    />
  ));
};

interface ReferenceLineProps {
  viewContent: ViewContent<ChartConfig>;
  isExporting?: boolean;
  isEnlarged?: boolean;
}

const AverageReferenceLine = ({ viewContent, isExporting, isEnlarged }: ReferenceLineProps) => {
  const { valueType, data, presentationOptions } = viewContent;
  // show reference line by default
  const shouldHideReferenceLine = presentationOptions && presentationOptions.hideAverage;
  // average is null for stacked charts that don't have a "value" key in data
  // @ts-ignore
  const average = data.reduce((acc: number, row: DataProps) => acc + row.value, 0) / data.length;

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
      // @ts-ignore
      isAnimationActive={isEnlarged && !isExporting}
    />
  );
};

const BarReferenceLine = ({ viewContent, isExporting, isEnlarged }: ReferenceLineProps) => {
  const { referenceLines } = viewContent.presentationOptions || {};
  if (referenceLines) {
    return ValueReferenceLine({ viewContent: { chartConfig: { ...referenceLines } }, isExporting });
  }
  return AverageReferenceLine({ viewContent, isExporting, isEnlarged });
};

export const ReferenceLines = ({ viewContent, isExporting, isEnlarged }: ReferenceLineProps) => {
  if (viewContent.chartType === ChartType.Bar) {
    return BarReferenceLine({ viewContent, isExporting, isEnlarged });
  }
  return ValueReferenceLine({ viewContent, isExporting });
};
