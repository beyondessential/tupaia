import React, { SVGProps, ReactNode } from 'react';
import { ICON_BASE_SIZE } from './constants';

interface IconContainerProps extends SVGProps<SVGSVGElement> {
  children?: ReactNode;
  scale?: number;
}

export const IconContainer = ({ children, scale = 1, ...props }: IconContainerProps) => (
  <svg
    width={`${ICON_BASE_SIZE * scale}px`}
    height={`${ICON_BASE_SIZE * scale}px`}
    viewBox="0 0 1000 1000"
    style={{ marginRight: '0.25rem' }}
    {...props}
  >
    {children}
  </svg>
);
