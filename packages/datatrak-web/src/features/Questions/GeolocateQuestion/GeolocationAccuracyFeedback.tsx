import { FormHelperText, FormHelperTextProps } from '@material-ui/core';
import React from 'react';
import styled from 'styled-components';

const RECOMMENDED_ACCURACY_METERS = 20;

const StyledHelperText = styled(FormHelperText)`
  color: oklch(54% 0 0);
`;

interface GeolocationAccuracyFeedbackProps extends Omit<FormHelperTextProps, 'children'> {
  /** Non-negative real number. In Metres. */
  accuracy: GeolocationCoordinates['accuracy'];
  /** If true, suppresses the prompt to retry and merely states the accuracy. */
  quiet?: boolean;
}

export const GeolocationAccuracyFeedback = ({
  accuracy,
  quiet,
  ...props
}: GeolocationAccuracyFeedbackProps) => {
  const rounded = accuracy.toFixed(2);
  const verbose = !quiet || accuracy > RECOMMENDED_ACCURACY_METERS;

  return (
    <StyledHelperText {...props}>
      {rounded}&nbsp;m accuracy
      {verbose && (
        <>
          . This doesn’t meet the recommended &lt;{RECOMMENDED_ACCURACY_METERS}&nbsp;m. Consider
          trying again when you have stronger GPS signal.
        </>
      )}
    </StyledHelperText>
  );
};
