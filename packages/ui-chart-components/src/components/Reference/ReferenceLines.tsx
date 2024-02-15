/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { ReferenceLine } from 'recharts';
import { formatDataValueByType } from '@tupaia/utils';
import { ChartType } from '@tupaia/types';
import { TUPAIA_ORANGE } from '../../constants';
import { CartesianChartViewContent } from '../../types';
import { ReferenceLabel } from './ReferenceLabel';

interface ReferenceLineProps {
  viewContent: CartesianChartViewContent;
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

/**
 * A reference line which is displayed by default on bar charts, showing the average value. This can
 * be suppressed by setting `hideAverage`.
 *
 * @remarks Not supported with stacked charts.
 *
 * @example
 * "presentationOptions": {
 *   "hideAverage": true
 * }
 */
const AverageReferenceLine = ({ viewContent }: ReferenceLineProps) => {
  const { valueType, data } = viewContent;
  const presentationOptions =
    'presentationOptions' in viewContent && viewContent.presentationOptions;
  // show reference line by default
  const shouldHideReferenceLine = presentationOptions && presentationOptions.hideAverage;
  // average is null for stacked charts that don't have a "value" key in data
  const average = data.reduce((acc: number, row) => acc + (row.value as number), 0) / data.length;

  if (!average || shouldHideReferenceLine) return null;

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

/**
 * A special case of the {@link ReferenceLines} component for bar charts. If no reference line is
 * explicitly defined, then a reference line showing the average is displayed.
 */
const BarReferenceLine = (props: ReferenceLineProps) =>
  props.viewContent.presentationOptions?.referenceLines
    ? ValueReferenceLine(props)
    : AverageReferenceLine(props);

/**
 * Returns a labelled `ReferenceLine`, which may be used in Cartesian charts.
 *
 * @example
 * "presentationOptions": {
 *   "referenceLines": {
 *     "targetLine": {
 *       "referenceLabel": "Total Beds",
 *       "referenceValue": 43
 *     }
 *   }
 * }
 *
 * @see https://recharts.org/en-US/api/ReferenceLine
 * @see https://recharts.org/en-US/examples/LineChartWithReferenceLines
 */
export const ReferenceLines = (props: ReferenceLineProps) => {
  return props.viewContent.chartType === ChartType.Bar
    ? BarReferenceLine(props)
    : ValueReferenceLine(props);
};
