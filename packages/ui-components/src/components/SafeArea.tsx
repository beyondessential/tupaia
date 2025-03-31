import React from 'react';
import styled, { css } from 'styled-components';

/** @see https://developer.mozilla.org/en-US/docs/Web/CSS/env */
export const SafeArea = styled.div<{
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
}>(props => {
  return css`
    --safe-area-min-padding-y: 1rem;
    --safe-area-min-padding-x: 1.25rem;
    ${props.top &&
    css`
      padding-top: max(env(safe-area-inset-top, 0), var(--safe-area-min-padding-y));
    `}
    ${props.bottom &&
    css`
      padding-bottom: max(env(safe-area-inset-bottom, 0), var(--safe-area-min-padding-y));
    `}
    ${props.left &&
    css`
      padding-left: max(env(safe-area-inset-left, 0), var(--safe-area-min-padding-x));
    `}
    ${props.right &&
    css`
      padding-right: max(env(safe-area-inset-right, 0), var(--safe-area-min-padding-x));
    `}
  `;
});

export const SafeAreaColumn = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <SafeArea {...props} left right />
);

/** @privateRemarks Consider setting `as="header"` */
export const SafeAreaHeader = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <SafeArea {...props} top />
);

/** @privateRemarks Consider setting `as="footer"` */
export const SafeAreaFooter = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <SafeArea {...props} bottom />
);
