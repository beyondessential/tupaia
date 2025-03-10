import React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import styled from 'styled-components';

const CheckCircle = styled.circle<{
  $optionColor?: string;
}>`
  fill: ${({ $optionColor, theme }) => $optionColor || theme.palette.primary.main};
`;

const OuterCircle = styled.circle<{
  $optionColor?: string;
  $checked?: boolean;
}>`
  stroke: ${({ $optionColor, $checked, theme }) => {
    if ($optionColor) return $optionColor;
    if ($checked) return theme.palette.primary.main;
    return theme.palette.text.primary;
  }};
`;

/**
 * Custom radio icon so that we can control the fill when radio inputs have a background color, as the MUI default one is a 'path' so can't have a fill
 */
export const RadioIcon = ({
  checked,
  optionColor,
  ...props
}: SvgIconProps & {
  checked?: boolean;
  optionColor?: string;
}) => {
  return (
    <SvgIcon
      {...props}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <OuterCircle cx="10" cy="10" r="9.5" $checked={checked} $optionColor={optionColor} />
      {checked && <CheckCircle cx="10" cy="10" r="5" $optionColor={optionColor} />}
    </SvgIcon>
  );
};
