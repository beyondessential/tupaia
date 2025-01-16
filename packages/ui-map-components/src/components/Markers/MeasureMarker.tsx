import React from 'react';
import { IconMarker } from './IconMarker';
import { CircleProportionMarker } from './CircleProportionMarker';
import { MarkerProps } from '../../types';

export const MeasureMarker = React.memo((props: MarkerProps) => {
  const { icon, radius = 0 } = props;

  if (radius !== undefined && parseInt(String(radius), 10) === 0) {
    if (icon) {
      // we have an icon, so don't render the radius at all
      return <IconMarker {...props} />;
    }

    // we have no icon and zero radius -- use minimum radius instead
    return <CircleProportionMarker {...props} radius={1} />;
  }

  if (radius && icon) {
    return (
      <>
        <CircleProportionMarker {...props} />
        <IconMarker {...props} />
      </>
    );
  }

  if (radius) {
    return <CircleProportionMarker {...props} />;
  }

  return <IconMarker {...props} />;
});
