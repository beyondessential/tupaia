import { Container } from '@material-ui/core';
import React from 'react';
import styled, { css } from 'styled-components';

/**
 * @deprecated
 * Consider using {@link SafeArea} or {@link SafeAreaColumn} instead, augmenting it with
 * {@link styled} as needed. This component sets `flex` and `position` values, which are easier to
 * work with when set by the consumer. This component remains for backward compatibility, and will
 * be removed in the future.
 */
export const PageContainer = styled(Container).attrs({
  maxWidth: false,
})`
  flex: 1;
  padding-left: max(env(safe-area-inset-left, 0), 1.25rem);
  padding-right: max(env(safe-area-inset-right, 0), 1.25rem);
  position: relative;
`;

export const SafeArea = styled.div<{
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
}>(props => {
  return css`
    ${props.top &&
    css`
      padding-top: max(env(safe-area-inset-top, 0), 1rem);
    `}
    ${props.bottom &&
    css`
      padding-bottom: max(env(safe-area-inset-bottom, 0), 1rem);
    `}
    ${props.left &&
    css`
      padding-left: max(env(safe-area-inset-left, 0), 1.25rem);
    `}
    ${props.right &&
    css`
      padding-right: max(env(safe-area-inset-right, 0), 1.25rem);
    `}
  `;
});

export const SafeAreaColumn = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <SafeArea {...props} left right />
);

export const SafeAreaHeader = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <SafeArea {...props} top />
);

export const SafeAreaFooter = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <SafeArea {...props} bottom />
);
