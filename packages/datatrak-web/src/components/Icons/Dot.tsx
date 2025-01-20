import { Property } from 'csstype';
import React, { SVGProps } from 'react';

export interface DotIconProps extends SVGProps<SVGElement> {
  /**
   * A human-readable title for this SVG, like alt text on an `<img>`.
   * @see https://www.w3.org/TR/SVG-access/#Equivalent
   */
  titleAccess?: string;
  htmlColor?: Property.Color;
  variant?: 'filled' | 'outlined';
}

export const DotIcon = ({
  titleAccess,
  htmlColor = 'currentcolor',
  variant = 'filled',
  viewBox = '0 0 8 8',
  height = 8,
  width = 8,
  ...props
}: DotIconProps) => {
  const fillOrStroke =
    variant === 'filled'
      ? {
          fill: htmlColor,
          r: 4,
        }
      : {
          stroke: htmlColor,
          strokeWidth: 2,
          r: 3,
        };

  return (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {titleAccess && <title>{titleAccess}</title>}
      <circle cx={4} cy={4} {...fillOrStroke} />
    </svg>
  );
};
