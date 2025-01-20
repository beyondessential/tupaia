import { Property } from 'csstype';
import React, { SVGProps } from 'react';
import { useTheme } from '@material-ui/core/styles';

export interface DotIconProps extends SVGProps<SVGElement> {
  title?: string;
  htmlColor?: Property.Color;
  variant?: 'filled' | 'outlined';
}

export const DotIcon = ({
  title,
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
      {title && <title>{title}</title>}
      <circle cx={4} cy={4} {...fillOrStroke} />
    </svg>
  );
};

export const SyncSuccessIcon = (props: DotIconProps) => {
  const { palette } = useTheme();
  return <DotIcon htmlColor={palette.success.main} {...props} />;
};

export const SyncNeutralIcon = (props: DotIconProps) => {
  const { palette } = useTheme();
  return <DotIcon variant="outlined" htmlColor={palette.grey[400]} {...props} />;
};
