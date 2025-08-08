import React from 'react';

interface ReferenceLabelProps {
  value?: string;
  fill: string;
  viewBox?: {
    width: number;
    y: number;
  };
  fontSize?: number;
}

const isMaxLabel = (value: string): boolean => value.toLowerCase().includes('max');

export const ReferenceLabel = ({ fill, fontSize = 14, value, viewBox }: ReferenceLabelProps) => {
  if (!value) return null;

  const x = (viewBox?.width || 0) / 2 + 30;
  const y = isMaxLabel(value) ? (viewBox?.y || 0) - 5 : (viewBox?.y || 0) + 15;

  return (
    <text x={x} y={y} fill={fill} fontSize={fontSize} fontWeight="bolder">
      {value}
    </text>
  );
};
