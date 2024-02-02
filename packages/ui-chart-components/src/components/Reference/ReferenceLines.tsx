/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { ReferenceLine } from 'recharts';
import { formatDataValueByType } from '@tupaia/utils';
import { TUPAIA_ORANGE } from '../../constants';
import { ChartType, ViewContent } from '../../types';
import { ReferenceLabel } from './ReferenceLabel';

interface ReferenceLineProps {
  viewContent: ViewContent;
  isExporting?: boolean;
  isEnlarged?: boolean;
}

const ValueReferenceLine = ({ viewContent, isExporting }: ReferenceLineProps) => {
  if (!viewContent.presentationOptions?.referenceLines?.targetLine) return null;

  const { referenceLabel, referenceValue } =
    viewContent.presentationOptions.referenceLines.targetLine;
  const color = isExporting ? 'black' : 'white';
  return (
    <ReferenceLine
      label={<ReferenceLabel value={referenceLabel} fill={color} />}
      stroke={color}
      strokeDasharray="8 3"
      y={referenceValue}
    />
  );
};

const AverageReferenceLine = ({ viewContent }: ReferenceLineProps) => {
  const { valueType, data, presentationOptions } = viewContent;
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

const BarReferenceLine = (props: ReferenceLineProps) =>
  props.viewContent.presentationOptions?.referenceLines
    ? ValueReferenceLine(props)
    : AverageReferenceLine(props);

export const ReferenceLines = ({ viewContent, isExporting, isEnlarged }: ReferenceLineProps) => {
  if (viewContent.chartType === ChartType.Bar) {
    return BarReferenceLine({ viewContent, isExporting, isEnlarged });
  }
  return ValueReferenceLine({ viewContent, isExporting });
};
