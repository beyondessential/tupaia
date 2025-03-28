import { Typography } from '@material-ui/core';
import React, { Fragment, ReactNode, isValidElement } from 'react';
import styled from 'styled-components';

import { TITLE_BAR_HEIGHT } from '../constants';

const Wrapper = styled.div<{
  $isTransparent?: boolean;
}>`
  --border-width: max(0.0625rem, 1px);
  block-size: ${TITLE_BAR_HEIGHT};
  background-color: ${({ theme, $isTransparent }) =>
    $isTransparent ? 'transparent' : theme.palette.background.paper};
  border-block-start: var(--border-width) solid ${({ theme }) => theme.palette.divider};
  // Make sure this is always visible, even with QR code panel open
  margin-block-start: calc(var(--border-width) * -1);
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  ${({ theme }) => theme.breakpoints.up('md')} {
    margin-inline: -1.25rem;
    margin-inline: -1.25rem;
  }
`;

const TitleWrapper = styled.div`
  padding: 0.8rem;
  display: flex;
  align-items: center;
  flex: 1;
  ${({ theme }) => theme.breakpoints.up('md')} {
    padding: 1.3rem;
  }
  .MuiSvgIcon-root {
    margin-right: 0.5rem;
  }
`;

const Heading = styled(Typography).attrs({ variant: 'h1' })``;

interface PageTitleBarProps extends React.ComponentPropsWithoutRef<typeof Wrapper> {
  children?: ReactNode | null;
  heading?: ReactNode | null;
  isTransparent?: boolean;
  leadingIcon?: ReactNode | null;
  trailingIcon?: ReactNode | null;
}

export const PageTitleBar = ({
  children,
  heading,
  isTransparent,
  leadingIcon,
  trailingIcon,
  ...props
}: PageTitleBarProps) => {
  const HeadingWrapper = isValidElement(heading) ? Fragment : Heading;

  return (
    <Wrapper $isTransparent={isTransparent} {...props}>
      <TitleWrapper>
        {leadingIcon}
        <HeadingWrapper>{heading}</HeadingWrapper>
        {trailingIcon}
      </TitleWrapper>
      {children}
    </Wrapper>
  );
};
