import { FormHelperText, FormHelperTextProps } from '@material-ui/core';
import React from 'react';

const RECOMMENDED_ACCURACY_METERS = 20;

interface GeolocationAccuracyFeedbackProps extends FormHelperTextProps {
  /** Metres */
  accuracy: number;
  /** If true, suppresses the prompt to retry and merely states the accuracy. */
  quiet?: boolean;
}

export const GeolocationAccuracyFeedback = ({
  accuracy,
  quiet,
}: GeolocationAccuracyFeedbackProps) => {
  const rounded = accuracy.toFixed(2);

  return quiet || accuracy < RECOMMENDED_ACCURACY_METERS ? (
    <FormHelperText>{rounded}&nbsp;m accuracy</FormHelperText>
  ) : (
    <FormHelperText>
      {rounded}&nbsp;m accuracy. This doesn’t meet the recommended &lt;
      {RECOMMENDED_ACCURACY_METERS}&nbsp;m. Consider trying again when you have stronger GPS signal.
    </FormHelperText>
  );
};
