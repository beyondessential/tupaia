import React from 'react';
import { ReferenceLine } from 'recharts';
import { formatDataValueByType } from '@tupaia/utils';
import { CartesianChartConfig, ChartReport, ChartType } from '@tupaia/types';
import { TUPAIA_ORANGE } from '../../constants';
import { ReferenceLabel } from './ReferenceLabel';

interface ReferenceLineProps {
  config: CartesianChartConfig;
  report: ChartReport;
  isExporting?: boolean;
  isEnlarged?: boolean;
}

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
 * @remarks Strictly speaking, `referenceLabel` is optional, but its inclusion is encouraged.
 *
 * @see https://recharts.org/en-US/api/ReferenceLine
 * @see https://recharts.org/en-US/examples/LineChartWithReferenceLines
 */
const ValueReferenceLine = ({ config, isExporting }: ReferenceLineProps) => {
  if (!config.presentationOptions?.referenceLines?.targetLine) return null;

  const { referenceLabel, referenceValue } = config.presentationOptions.referenceLines.targetLine;
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
const AverageReferenceLine = ({ report, config }: ReferenceLineProps) => {
  const { valueType } = config;
  const { data = [] } = report;
  const presentationOptions = 'presentationOptions' in config && config.presentationOptions;
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
  props.config.presentationOptions?.referenceLines
    ? ValueReferenceLine(props)
    : AverageReferenceLine(props);

export const ReferenceLines = (props: ReferenceLineProps) => {
  return props.config.chartType === ChartType.Bar
    ? BarReferenceLine(props)
    : ValueReferenceLine(props);
};
