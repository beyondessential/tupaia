import React from 'react';
import styled, { css } from 'styled-components';

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/env
 * @privateRemarks Using absolute properties because `safe-area-inset-*`
 * [has no logical equivalents](https://github.com/w3c/csswg-drafts/issues/6379).
 */
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

export const SafeAreaColumn = styled.div`
  --safe-area-min-padding-x: 1.25rem;
  padding-left: max(env(safe-area-inset-left, 0), var(--safe-area-min-padding-x));
  padding-right: max(env(safe-area-inset-right, 0), var(--safe-area-min-padding-x));
`;

/** @privateRemarks Consider setting `as="header"` */
export const SafeAreaHeader = styled.div`
  --safe-area-min-padding-y: 1rem;
  padding-top: max(env(safe-area-inset-top, 0), var(--safe-area-min-padding-y));
`;

/** @privateRemarks Consider setting `as="footer"` */
export const SafeAreaFooter = styled.div`
  --safe-area-min-padding-y: 1rem;
  padding-bottom: max(env(safe-area-inset-bottom, 0), var(--safe-area-min-padding-y));
`;
